<script lang="ts">
    export let value: number;
    export let textContent: string;
    export let postData: (data: object) => void;

    import { volume, currentInterval } from '../stores.js';

    function handleVolumeChange() {
        if (volume.update(value)) {
            postData({ event: 'volume-change', volume: $volume });
        }
    }

    function buttonHoldStart(ev: Event) {
        if (ev.target !== document.activeElement) {
            (ev.target as HTMLButtonElement).focus();
        }

        // if you press two volume buttons at the same time,
        // one might be able to skip the race and not be cleared
        if ($currentInterval.value) {
            clearInterval($currentInterval.value);
        }

        $currentInterval.value = setInterval(handleVolumeChange, 200);
        $currentInterval.type = ev.type.includes('mouse') ? 'mouse' : 'touch';
    }

    function buttonHoldFinish() {
        if ($currentInterval.value) {
            clearInterval($currentInterval.value);
            currentInterval.set({ value: 0, type: '' });
        }
    }
</script>

<button
    class={value >= 0 ? 'green' : 'red'}
    on:click={handleVolumeChange}
    on:mousedown={buttonHoldStart}
    on:touchstart={buttonHoldStart}
    on:touchend={buttonHoldFinish}
    on:touchcancel={buttonHoldFinish}
>
    {textContent}
</button>

<style>
    button {
        font-size: 30px;
        padding: 10px 0;
        border-bottom: 4px solid transparent;
        border-radius: 3px;
    }

    button:focus {
        outline: 2px solid white;
        border-radius: 0;
    }

    .green {
        background-color: var(--green-1);
        border-bottom-color: var(--green-2);
    }

    .red {
        background-color: var(--red-1);
        border-bottom-color: var(--red-4);
    }
</style>
