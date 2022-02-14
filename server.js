#!/usr/bin/env node
// @ts-check
import WebSocket from 'ws';
import express from 'express';

import http from 'http';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

import { getMuted, getVolume, setMuted, setVolume } from './controller.js';

const app = express();
const server = http.createServer(app);
const websocketServer = new WebSocket.Server({ server });

const port = 8080;
/** @type {import("robotjs")} */
let robot;

try {
    // @ts-ignore
    robot = (await import('robotjs')).default;
    console.log(robot);
} catch (e) {
    console.error(e);
}

// @ts-ignore
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const networkInterfaces = os.networkInterfaces();
let ip = '';

// mainly copied from https://github.com/vercel/serve
for (const networkInterface of Object.values(networkInterfaces)) {
    for (const network of networkInterface) {
        const { address, family, internal } = network;

        if (family === 'IPv4' && !internal) {
            ip = address;
            break;
        }
    }
}

server.listen(port, () => {
    console.log('ready at localhost:' + port);
    console.log(`visit on another device @ http://${ip}:${port}`);
});
app.use(express.static(path.join(__dirname, 'public')));

/**
 *
 * @param {WebSocket} currentSocket
 * @param {object} data
 */
function broadcastData(currentSocket, data) {
    websocketServer.clients.forEach((client) => {
        if (client !== currentSocket && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

websocketServer.on('connection', async (socket) => {
    Promise.all([getVolume(), getMuted()]).then(([volume, muted]) => {
        socket.send(
            JSON.stringify({
                volume,
                muted,
                messageName: 'initial-data',
                isRobotJSInstalled: !!robot,
            })
        );
    });

    socket.on('message', function (message) {
        /** @type {import("./src/types.js").PostDataOptions} */
        const data = JSON.parse(message.toString());

        if ('volume' in data) {
            setVolume(data.volume);
            broadcastData(socket, data);
        } else if ('muted' in data) {
            setMuted(data.muted);
            broadcastData(socket, data);
        } else if (data.key) {
            const { type, content, modifiers = [] } = data.key;

            switch (type) {
                case 'tap':
                    try {
                        robot.keyTap(content, modifiers);
                    } catch (e) {
                        console.error(e);
                    }

                    break;
                case 'type':
                    robot.typeString(content);
                    break;
            }
        } else if (data.mouse) {
            const type = data.mouse.type;
            const current = robot.getMousePos();

            switch (type) {
                case 'click':
                    robot.mouseClick(data.mouse.button, data.mouse.double);
                    break;
                case 'move-mouse':
                    robot.moveMouse(
                        current.x + data.mouse.x,
                        current.y + data.mouse.y
                    );
                    break;
                case 'drag-mouse':
                    robot.mouseToggle('down');
                    robot.dragMouse(
                        current.x + data.mouse.x,
                        current.y + data.mouse.y
                    );
                    robot.mouseToggle('up');
                    break;
            }
        }
    });
});
