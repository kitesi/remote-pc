<script lang="ts">
    import type { PostData } from '../types';

    export let postData: PostData;
    export let name: string;
    export let textContent: string;
    export let x: number;
    export let y: number;

    interface OwnInterval {
        sensitivity?: number;
        value?: NodeJS.Timeout;
    }

    const interval: OwnInterval = {};

    function getSensitivity() {
        const input = document.getElementById(
            'sensitivity'
        ) as HTMLInputElement;
        return parseInt(input.value);
    }

    function changeMousePos() {
        const dragInput = document.getElementById('drag') as HTMLInputElement;
        const type = dragInput.checked ? 'drag-mouse' : 'move-mouse';
        const amplifier = interval.sensitivity || getSensitivity();

        postData({
            mouse: {
                x: x * amplifier,
                y: y * amplifier,
                type,
            },
        });
    }

    function continuouslyChangeMousePos() {
        interval.sensitivity += 2;
        changeMousePos();
    }

    function touchStart(ev: Event) {
        if (ev.target !== document.activeElement) {
            (ev.target as HTMLButtonElement).focus();
        }

        interval.sensitivity = getSensitivity();
        interval.value = setInterval(continuouslyChangeMousePos, 200);
    }

    function touchFinish() {
        clearInterval(interval.value);
        interval.sensitivity = undefined;
    }
</script>

<button
    style="grid-area: {name}"
    class:double-mouse-change={name.includes('-')}
    on:click={changeMousePos}
    on:touchstart={touchStart}
    on:touchend={touchFinish}
    on:touchcancel={touchFinish}
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
