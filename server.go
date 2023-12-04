package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"

	"github.com/go-vgo/robotgo"
	"github.com/gorilla/websocket"
	"github.com/itchyny/volume-go"
)

type IncomingMessage struct {
	Event  string `json:"event"`
	Volume int    `json:"volume"`
	Muted  bool   `json:"muted"`
	Mouse  struct {
		Type   string `json:"type"`
		Button string `json:"button"`
		Double bool   `json:"double"`
		X      int    `json:"x"`
		Y      int    `json:"y"`
	}
	Key struct {
		Type      string   `json:"type"`
		Content   string   `json:"content"`
		Modifiers []string `json:"modifiers"`
	}
}

// define a reader which will listen for
// new messages being sent to our WebSocket
// endpoint
func reader(conn *websocket.Conn) error {
	for {
		// read in a message
		messageType, p, err := conn.ReadMessage()
		if err != nil {
			return err
		}

		// print out that message for clarity
		fmt.Println("Recieved message: " + string(p))

		if err := conn.WriteMessage(messageType, p); err != nil {
			return err
		}

		data := IncomingMessage{}
		err = json.Unmarshal(p, &data)

		if data.Event == "volume-change" {
			err = volume.SetVolume(data.Volume)
		} else if data.Event == "mute-change" {
			if data.Muted {
				err = volume.Mute()
			} else {
				err = volume.Unmute()
			}

			if err != nil {
				log.Println(err)
			}
		} else if data.Event == "mouse" {
			switch data.Mouse.Type {
			case "move":
				robotgo.MoveRelative(data.Mouse.X, data.Mouse.Y)
			case "click":
				robotgo.Click(data.Mouse.Button, data.Mouse.Double)
			case "drag":
				robotgo.Toggle("left")
				robotgo.MoveRelative(data.Mouse.X, data.Mouse.Y)
				robotgo.Toggle("left", "up")
			}
		} else if data.Event == "key" {
			switch data.Key.Type {
			case "tap":
				robotgo.KeyTap(data.Key.Content, data.Key.Modifiers)
			case "type":
				robotgo.TypeStr(data.Key.Content)
			}

		}

		if err != nil {
			return err
		}
	}
}

func handleWS(w http.ResponseWriter, r *http.Request, upgrader websocket.Upgrader) error {
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }

	ws, err := upgrader.Upgrade(w, r, nil)

	if err != nil {
		return err
	}

	fmt.Println("Client Connected")

	currentVolume, err := volume.GetVolume()
	fmt.Println(currentVolume, err)

	if err != nil {
		return fmt.Errorf("Could not get volume")
	}

	isMuted, err := volume.GetMuted()

	if err != nil {
		return fmt.Errorf("Could not get mute status")
	}

	jsonInfo := fmt.Sprintf("{\"volume\": %d, \"muted\": %t, \"messageName\": \"initial-data\", \"canControlKeyboardAndMouse\": true }", currentVolume, isMuted)

	if err = ws.WriteMessage(1, []byte(jsonInfo)); err != nil {
		return err
	}

	reader(ws)

	return nil
}

func setupRoutes() {
	fileServer := http.FileServer(http.Dir("./public"))
	http.Handle("/", fileServer)

	upgrader := websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		err := handleWS(w, r, upgrader)

		if err != nil {
			log.Println(err)
		}
	})

}

// https://stackoverflow.com/a/37382208/
func getIPAddress() string {
	conn, err := net.Dial("udp", "8.8.8.8:80")

	if err != nil {
		log.Fatal(err)
	}

	defer conn.Close()
	localAddr := conn.LocalAddr().(*net.UDPAddr)

	return localAddr.IP.String()
}

func main() {
	port := 8080
	ip := getIPAddress()

	if ip == "" {
		log.Fatal("Could not get IP address")
		os.Exit(1)
	}

	fmt.Printf("Starting server at http://localhost:%d\nVisit on another device @ http://%s:%d\n", port, ip, port)

	setupRoutes()

	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}
}
