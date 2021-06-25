<script context="module" lang="ts">
	let interval: NodeJS.Timeout;
</script>

<script lang="ts">
	export let value: number;
	export let textContent: string;
	export let postData: (data: object) => void;

	import { volume } from '../stores.js';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	function handleVolumeChange() {
		const oldVolume = $volume;
		let nextVolume = oldVolume + value;

		if (nextVolume > 100) {
			nextVolume = 100;
		} else if (nextVolume < 0) {
			nextVolume = 0;
		}

		if (oldVolume !== nextVolume) {
			volume.set(nextVolume);
			postData({ volume: nextVolume });
		}
	}

	function buttonHoldStart(ev: Event) {
		if (ev.target !== document.activeElement) {
			(ev.target as HTMLButtonElement).focus();
		}

		// if you press two volume buttons at the same time,
		// one might be able to skip the race and not be cleared
		if (interval) {
			clearInterval(interval);
		}

		interval = setInterval(handleVolumeChange, 200);

		dispatch('new-interval', { value: interval, type: ev.type });
	}

	function buttonHoldFinish() {
		if (interval) {
			clearInterval(interval);
			interval = undefined;
		}
	}
</script>

<button
	class={value >= 0 ? 'green' : 'red'}
	on:click={(ev) => ev}
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
