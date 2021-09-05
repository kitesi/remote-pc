<script lang="ts">
    import type { InitialData } from './types.js';
    import Loading from './components/Loading.svelte';
    import Media from './components/Media.svelte';
    import MouseKeyboard from './components/MouseKeyboard.svelte';

    let socket: WebSocket;
    let initialData: InitialData;

    function connect() {
        socket = new WebSocket(`ws://${window.location.host}`);

        socket.addEventListener('close', () => {
            setTimeout(connect, 1000);
        });
    }

    connect();

    socket.addEventListener(
        'message',
        function (message) {
            initialData = JSON.parse(message.data);
        },
        { once: true }
    );

    function postData(data: object) {
        socket.send(JSON.stringify(data));
    }
</script>

{#if initialData}
    <section>
        <Media {initialData} {socket} {postData} />
        <MouseKeyboard {postData} />
    </section>
{:else}
    <Loading />
{/if}

<style>
    section {
        max-height: 100vh;
    }

    @media screen and (min-width: 800px) {
        section {
            display: grid;
            grid-template-columns: 1fr 1fr;
        }
    }
</style>
