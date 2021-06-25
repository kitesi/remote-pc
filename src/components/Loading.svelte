<script>
	import { onDestroy } from 'svelte';
	import { fly } from 'svelte/transition';

	let message;

	const timeoutMessage = setTimeout(() => {
		message.textContent = 'You might need to refresh your page.';
		message.classList.add('long-request');
		message.addEventListener('click', () => window.location.reload());
	}, 3000);

	onDestroy(() => {
		clearTimeout(timeoutMessage);
	});
</script>

<h1 out:fly={{ y: 200, duration: 500 }} bind:this={message}>Loading...</h1>

<style>
	h1 {
		position: absolute;
		background-color: var(--purple-1);
		text-align: center;
		font-weight: 700;
		width: 300px;
		max-width: 90%;
		border-bottom: 6px solid var(--purple-2);
		margin-bottom: 10px;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	:global(h1.long-request) {
		background-color: var(--red-3);
		border-bottom-color: var(--red-4);
		width: 350px;
		cursor: pointer;
	}
</style>
