<script lang="ts">
	import type { PostData } from '../types.js';
	export let postData: PostData;

	interface Inputs {
		'bind-keys'?: HTMLInputElement;
		'bind-mouse'?: HTMLInputElement;
		drag?: HTMLInputElement;
		ctrl?: HTMLInputElement;
		shift?: HTMLInputElement;
		alt?: HTMLInputElement;
	}

	import MouseControls from './MouseControls.svelte';
	import { getConfig } from '../config.js';

	const { mouseSensitivity, keyShortcuts } = getConfig();
	const inputs: Inputs = {};

	let sensitivity = 25;
	let contentInput: HTMLInputElement;

	function keyTap(key: string) {
		return function () {
			postData({ key: { type: 'tap', content: key } });
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

			if (contentInput.value) {
				postData({
					key: {
						type,
						content: contentInput.value,
						modifiers: modifiers,
					},
				});
			}
		};
	}

	const prevMousePos: { x?: number; y?: number } = {};

	document.body.addEventListener('mousemove', (e) => {
		if (!inputs['bind-mouse'].checked) {
			return;
		}

		if (typeof prevMousePos.x !== 'undefined') {
			postData({
				mouse: {
					type: 'move-mouse',
					x: -(prevMousePos.x - e.x),
					y: -(prevMousePos.y - e.y),
				},
			});
		}

		prevMousePos.x = e.x;
		prevMousePos.y = e.y;
	});

	document.body.addEventListener('keydown', (e) => {
		if (e.target !== document.body) {
			return;
		}

		if (e.key === 'k' && e.ctrlKey && !e.shiftKey && !e.altKey) {
			inputs['bind-keys'].checked = !inputs['bind-keys'].checked;
			return e.preventDefault();
		}

		if (e.key === 'm' && e.ctrlKey && !e.shiftKey && !e.altKey) {
			inputs['bind-mouse'].checked = !inputs['bind-mouse'].checked;

			if (!inputs['bind-mouse'].checked) {
				prevMousePos.x = undefined;
				prevMousePos.y = undefined;
			}

			return e.preventDefault();
		}

		if (e.key === 'c' && e.ctrlKey && !e.shiftKey && !e.altKey) {
			postData({ mouse: { type: 'click', button: 'left', double: false } });
			return e.preventDefault();
		}

		if (!inputs['bind-keys'].checked) {
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
			key: {
				type: 'tap',
				content: key,
				modifiers,
			},
		});
	});
</script>

<section id="mouse-keyboard">
	<MouseControls {postData} />
	<div class="modes">
		<input type="checkbox" id="bind-mouse" bind:this={inputs['bind-mouse']} />
		<label for="bind-mouse">Bind Mouse</label>
		<input type="checkbox" id="bind-keys" bind:this={inputs['bind-keys']} />
		<label for="bind-keys">Bind Keys</label>
		<input type="checkbox" id="drag" bind:this={inputs.drag} />
		<label for="drag">Drag</label>
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
		<div>
			<label class="sensitivity-label">
				Sensitivity: {sensitivity}
				<input
					id="sensitivity"
					type="range"
					min={mouseSensitivity.min}
					max={mouseSensitivity.max}
					step={mouseSensitivity.step}
					bind:value={sensitivity}
				/>
			</label>
		</div>
		<div class="text">
			<label>
				Text:
				<input type="text" bind:this={contentInput} />
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
		/* padding: 20px; */
		/* align-items: flex-start; */
		/* align-content: flex-start; */
	}

	.modes {
		padding: 0 10px;
		grid-area: modes;
	}

	.keys {
		padding: 10px 10px 20px 10px;
		grid-area: key-shortcuts;
	}

	.other {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		grid-area: other;
		padding: 0 20px 20px 20px;
	}

	.other label,
	.other input {
		display: block;
		font-size: 24px;
	}

	.other input {
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

	section {
		display: grid;
		align-content: flex-start;
		grid-template-areas: 'mouse' 'modes' 'key-shortcuts' 'other';
		/* grid-template-columns: 1fr 1fr;
		grid-template-rows: 1fr 1fr;
		grid-template-areas:
			'mouse modes'
			'key-shortcuts other'; */
		background-color: var(--black-2);
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

	input[type='checkbox'] {
		display: none;
	}

	input:checked + label {
		background-color: var(--blue-3);
		border-color: var(--blue-1);
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
