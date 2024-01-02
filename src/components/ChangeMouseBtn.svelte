<script lang="ts">
    import type { PostData } from '../types';
    import { currentInterval } from '../stores.js';

    export let postData: PostData;
    export let name: string;
    export let textContent: string;
    export let x: number;
    export let y: number;

    let currentSensitivity = 0;

    function getSensitivity() {
        const input = document.getElementById(
            'sensitivity'
        ) as HTMLInputElement;
        return parseInt(input.value);
    }

    function changeMousePos() {
        const dragInput = document.getElementById('drag') as HTMLInputElement;
        const scrollInput = document.getElementById(
            'scroll'
        ) as HTMLInputElement;

        let type: 'move' | 'drag' | 'scroll' = 'move';

        if (dragInput.checked) {
            type = 'drag';
        } else if (scrollInput.checked) {
            type = 'scroll';
        }

        const amplifier = currentSensitivity || getSensitivity();

        postData({
            event: 'mouse',
            mouse: {
                x: x * amplifier,
                y: y * amplifier,
                type,
            },
        });
    }

    function continuouslyChangeMousePos() {
        currentSensitivity += 2;
        changeMousePos();
    }

    function buttonHoldStart(ev: Event) {
        if (ev.target !== document.activeElement) {
            (ev.target as HTMLButtonElement).focus();
        }

        currentSensitivity = getSensitivity();
        $currentInterval.type = ev.type.includes('mouse') ? 'mouse' : 'touch';
        $currentInterval.value = setInterval(continuouslyChangeMousePos, 200);
    }

    function buttonHoldFinish() {
        if ($currentInterval.value) {
            clearInterval($currentInterval.value);
        }
        currentInterval.set({ value: 0, type: '' });
    }
</script>

<button
    style="grid-area: {name}"
    class:double-mouse-change={name.includes('-')}
    on:click={changeMousePos}
    on:mousedown={buttonHoldStart}
    on:touchstart={buttonHoldStart}
    on:touchend={buttonHoldFinish}
    on:touchcancel={buttonHoldFinish}
>
    {textContent}
</button>

<style>
    button {
        background-color: var(--blue-1);
        font-size: 28px;
    }

    .double-mouse-change {
        background-color: var(--blue-2);
        transform: scale(0.8);
    }

    .double-mouse-change:active {
        transform: scale(0.9);
    }
</style>
