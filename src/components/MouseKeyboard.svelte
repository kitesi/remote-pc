<script lang="ts">
    import type { PostData } from '../types.js';
    export let postData: PostData;

    interface Inputs {
        drag?: HTMLInputElement;
        scroll?: HTMLInputElement;
        ctrl?: HTMLInputElement;
        shift?: HTMLInputElement;
        alt?: HTMLInputElement;
        content?: HTMLInputElement;
    }

    import MouseControls from './MouseControls.svelte';
    import { volume, muted } from '../stores.js';
    import { getConfig } from '../config.js';

    const { mouseSensitivity, keyShortcuts } = getConfig();
    const inputs: Inputs = {};

    let sensitivity = 25;
    let inKeyMode = false;
    let inMouseMode = false;
    let inReverseMouseMode = false;

    $: {
        if (!inMouseMode) {
            inReverseMouseMode = false;
            prevMousePos.x = undefined;
            prevMousePos.y = undefined;
        }
    }

    function keyTap(key: string) {
        return function () {
            postData({
                event: 'keypress',
                key: { type: 'tap', content: key },
            });
        };
    }

    function baseCustomKey(type: 'tap' | 'type') {
        return function (e: MouseEvent) {
            const modifiers: string[] = [];

            if (inputs.ctrl.checked || e.ctrlKey) {
                modifiers.push('control');
            }

            if (inputs.shift.checked || e.shiftKey) {
                modifiers.push('shift');
            }

            if (inputs.alt.checked || e.altKey) {
                modifiers.push('alt');
            }

            if (inputs.content.value) {
                postData({
                    event: 'keypress',
                    key: {
                        type,
                        content: inputs.content.value,
                        modifiers: modifiers,
                    },
                });
            }
        };
    }

    const prevMousePos: { x?: number; y?: number } = {};

    document.body.addEventListener('mousemove', (e) => {
        if (!inMouseMode) {
            return;
        }

        if (typeof prevMousePos.x !== 'undefined') {
            postData({
                event: 'mouse',
                mouse: {
                    type: 'move',
                    x: (inReverseMouseMode ? 1 : -1) * (prevMousePos.x - e.x),
                    y: (inReverseMouseMode ? 1 : -1) * (prevMousePos.y - e.y),
                },
            });
        }

        prevMousePos.x = e.x;
        prevMousePos.y = e.y;
    });

    document.body.addEventListener('keydown', (e) => {
        if (e.target instanceof HTMLInputElement) {
            return;
        }

        if (e.key === 'k' && e.ctrlKey && !e.altKey) {
            inKeyMode = !inKeyMode;
            return e.preventDefault();
        }

        if (e.key === 'm' && e.ctrlKey && !e.altKey) {
            inMouseMode = !inMouseMode;
            return e.preventDefault();
        }

        if (e.key === 'c' && (e.ctrlKey || !inKeyMode) && !e.altKey) {
            postData({
                event: 'mouse',
                mouse: { type: 'click', button: 'left', double: false },
            });
            return e.preventDefault();
        }

        if (inMouseMode) {
            if (e.key === 'r' && !e.ctrlKey && !e.altKey) {
                inReverseMouseMode = !inReverseMouseMode;
                return;
            }
        }

        if (!inKeyMode) {
            if (e.ctrlKey || e.altKey) {
                return;
            }

            let key: string;

            switch (e.key) {
                case 'm':
                    muted.set(!$muted);
                    postData({ event: 'mute-change', muted: $muted });
                    break;
                case '+':
                case '=':
                    volume.update(1);
                    postData({ event: 'volume-change', volume: $volume });
                    break;
                case '-':
                    volume.update(-1);
                    postData({ event: 'volume-change', volume: $volume });
                    break;
                case 'Escape':
                    key = 'escape';
                    break;
                case ' ':
                    key = 'audio_pause';
                    break;
            }

            if (key) {
                postData({
                    event: 'keypress',
                    key: {
                        type: 'tap',
                        content: key,
                    },
                });
            }

            return;
        }

        e.preventDefault();

        const notAccepted = [
            'Control',
            'Shift',
            'Alt',
            'Meta',
            'LaunchMail',
            'LaunchApplication1',
            'LaunchApplication2',
            'ScreenLock',
            'Clear',
            'OS',
            'Pause',
        ];

        if (notAccepted.includes(e.key)) {
            return;
        }

        const modifiers: string[] = [];

        if (e.ctrlKey) {
            modifiers.push('control');
        }

        if (e.shiftKey) {
            modifiers.push('shift');
        }

        if (e.shiftKey) {
            modifiers.push('alt');
        }

        let key = e.key;

        switch (key) {
            case 'ArrowUp':
                key = 'up';
                break;
            case 'ArrowDown':
                key = 'down';
                break;
            case 'ArrowLeft':
                key = 'left';
                break;
            case 'ArrowRight':
                key = 'right';
                break;
            case 'AudioVolumeUp':
                key = 'audio_vol_up';
                break;
            case 'AudioVolumeDown':
                key = 'audio_vol_down';
                break;
            case 'AudioVolumeMute':
                key = 'audio_mute';
                break;
            case 'MediaStop':
                key = 'audio_stop';
                break;
            case 'MediaTrackPrevious':
                key = 'audio_prev';
                break;
            case 'MediaPlayPause':
                key = 'audio_pause';
                break;
            case 'MediaTrackNext':
                key = 'audio_next';
                break;
            default:
                if (key.length !== 1) {
                    key = key.toLowerCase();
                }

                break;
        }

        postData({
            event: 'keypress',
            key: {
                type: 'tap',
                content: key,
                modifiers,
            },
        });
    });
</script>

<section id="mouse-keyboard">
    <div class="sensitivity-container">
        <label class="sensitivity-label" for="sensitivity">
            Sensitivity: {sensitivity}
        </label>
        <input
            id="sensitivity"
            type="range"
            min={mouseSensitivity.min}
            max={mouseSensitivity.max}
            step={mouseSensitivity.step}
            bind:value={sensitivity}
        />
    </div>
    <MouseControls {postData} />
    <div class="modes">
        <input type="checkbox" id="mouse-mode" bind:checked={inMouseMode} />
        <label for="mouse-mode" class:in-reverse-mode={inReverseMouseMode}
            >Mouse Mode</label
        >
        <input type="checkbox" id="key-mode" bind:checked={inKeyMode} />
        <label for="key-mode">Key Mode</label>
        <input type="checkbox" id="drag" bind:this={inputs.drag} />
        <label for="drag">Drag</label>
        <input type="checkbox" id="scroll" bind:this={inputs.scroll} />
        <label for="scroll">Scroll</label>
        <input type="checkbox" id="ctrl" bind:this={inputs.ctrl} />
        <label for="ctrl">Ctrl</label>
        <input type="checkbox" id="shift" bind:this={inputs.shift} />
        <label for="shift">Shift</label>
        <input type="checkbox" id="alt" bind:this={inputs.alt} />
        <label for="alt">Alt</label>
    </div>
    <div class="keys">
        {#each keyShortcuts as { key, text }}
            <button on:click={keyTap(key)}>{text}</button>
        {/each}
    </div>
    <div class="other">
        <div class="text">
            <label>
                Text:
                <input type="text" bind:this={inputs.content} />
            </label>
            <div>
                <button on:click={baseCustomKey('tap')}>Key Tap</button>
                <button on:click={baseCustomKey('type')}>Type</button>
            </div>
        </div>
    </div>
</section>

<style>
    .modes,
    .keys {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        justify-content: center;
    }

    .modes {
        padding: 0 10px;
    }

    .keys {
        padding: 10px 10px 20px 10px;
    }

    .other {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        padding: 0 20px 20px 20px;
    }

    .sensitivity-container {
        display: flex;
        justify-content: space-around;
        background-color: var(--black-3);
        padding: 10px;
    }

    .sensitivity-container label {
        font-size: 24px;
    }

    .other label,
    .other input {
        display: block;
        font-size: 24px;
    }

    .other input,
    .sensitivity-container input {
        width: 200px;
    }

    .other > div {
        display: flex;
        flex-direction: column;
        align-items: center;
        border: 3px solid var(--black-3);
        padding: 15px;
        border-radius: 5px;
        width: 80%;
    }

    .text input {
        border-radius: 3px;
        border: none;
        padding: 10px;
        margin: 10px 0;
    }

    .modes label,
    button {
        display: block;
        background-color: var(--black-3);
        border-bottom: 4px solid var(--black-1);
        font-size: 24px;
        padding: 15px;
        min-width: 70px;
        border-radius: 5px;
        text-align: center;
        cursor: pointer;
        text-transform: uppercase;
        transition: all 0.2s ease;
    }

    .text div {
        display: flex;
        gap: 10px;
    }

    .text button {
        background-color: var(--blue-1);
        border-bottom-color: var(--blue-2);
    }

    section {
        background-color: var(--black-2);
        width: 100%;
    }

    input[type='checkbox'] {
        display: none;
    }

    input:checked + label {
        background-color: var(--blue-3);
        border-color: var(--blue-1);
    }

    input:checked + label.in-reverse-mode {
        background-color: var(--red-3);
        border-color: var(--red-4);
    }

    @media screen and (max-width: 375px) {
        .other label,
        .other input {
            font-size: 18px;
        }
    }

    @media screen and (min-width: 800px) {
        section {
            box-sizing: border-box;
            max-height: 100vh;
            overflow: auto;
            scrollbar-width: thin;
        }
    }
</style>
