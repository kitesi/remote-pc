<script lang="ts">
    import type { SvelteEvent, InitialData, PostData } from '../types.js';

    export let socket: WebSocket;
    export let postData: PostData;
    export let initialData: InitialData;

    import ChangeVolumeBtn from './ChangeVolumeBtn.svelte';

    import { fade } from 'svelte/transition';
    import { volume, muted } from '../stores.js';

    volume.set(initialData.volume);
    muted.set(initialData.muted);

    const currentInterval: {
        type?: string;
        value?: number;
    } = {};

    socket.addEventListener('message', function (message) {
        const data = JSON.parse(message.data);

        if (data.muted !== $muted) {
            muted.set(data.muted);
        } else {
            volume.set(data.volume);
        }
    });

    function sendKey(key: string) {
        return function () {
            postData({
                key: {
                    type: 'tap',
                    content: key,
                },
            });
        };
    }

    function toggleMute() {
        muted.set(!$muted);
        postData({ muted: $muted });
    }

    function changeCurrentInterval(ev: SvelteEvent) {
        Object.assign(currentInterval, ev.detail);
    }

    function removeCurrentInterval(ev: SvelteEvent) {
        // if its a touch don't stop because of mousedown, mouseup, or mouseleave
        if (
            ev.type.startsWith('mouse') &&
            currentInterval.type !== 'mousedown'
        ) {
            return;
        }

        if (currentInterval.value) {
            clearInterval(currentInterval.value);
            currentInterval.value = undefined;
            currentInterval.type = undefined;
        }
    }
</script>

<svelte:body
    on:mouseout={removeCurrentInterval}
    on:mouseup={removeCurrentInterval}
    on:mouseleave={removeCurrentInterval} />

<section in:fade={{ duration: 1000 }}>
    <div class="inner-container">
        <h1 class="volume">VOLUME: {$volume}</h1>
        <div class="change-volume-btns">
            <ChangeVolumeBtn
                on:new-interval={changeCurrentInterval}
                textContent="+"
                value={1}
                {postData}
            /><ChangeVolumeBtn
                on:new-interval={changeCurrentInterval}
                textContent="-"
                value={-1}
                {postData}
            /><ChangeVolumeBtn
                on:new-interval={changeCurrentInterval}
                textContent="+5"
                value={5}
                {postData}
            />
            <ChangeVolumeBtn
                on:new-interval={changeCurrentInterval}
                textContent="-5"
                value={-5}
                {postData}
            />
        </div>
        <div class="media-buttons">
            <button on:click={toggleMute}>
                <ion-icon name={$muted ? 'volume-mute' : 'volume-high'} />
            </button>
            {#if initialData.isRobotJSInstalled}
                <button on:click={sendKey('audio_prev')}>
                    <ion-icon name="play-skip-back-circle" />
                </button>
                <button on:click={sendKey('audio_pause')}>
                    <ion-icon name="pause-circle" />
                </button>
                <button on:click={sendKey('audio_next')}>
                    <ion-icon name="play-skip-forward-circle" />
                </button>
            {/if}
        </div>
    </div>
</section>

<style>
    .inner-container {
        display: grid;
        grid-gap: 10px;
        width: 320px;
        max-width: 90%;
        margin: auto 0;
        padding-top: 10px;
    }

    .change-volume-btns {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-gap: 10px;
    }

    .media-buttons {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        grid-gap: 10px;
        justify-content: space-between;
    }

    section {
        display: flex;
        justify-content: center;
        text-align: center;
        height: 100vh;
        max-height: 100vh;
        overflow: auto;
    }

    button {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--purple-1);
        font-size: 30px;
        font-weight: 600;
        border-bottom: 4px solid var(--purple-2);
        padding: 10px 0;
    }

    h1 {
        background-color: var(--purple-1);
        font-size: 1.8rem;
        font-weight: 700;
    }

    @media screen and (max-height: 300px) {
        .inner-container {
            width: auto;
            grid-template-columns: 1fr 1fr;
            grid-template-areas:
                'volume volume-buttons'
                'media-buttons volume-buttons';
        }

        .volume {
            grid-area: volume;
        }

        .change-volume-btns {
            grid-area: volume-buttons;
        }

        .media-buttons {
            grid-area: media-buttons;
        }

        .media-buttons button {
            align-self: flex-start;
            padding: 5px;
        }
    }
</style>
