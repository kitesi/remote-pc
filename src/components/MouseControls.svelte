<script lang="ts">
    import type { PostData } from '../types.js';
    export let postData: PostData;

    import ChangeMouseBtn from './ChangeMouseBtn.svelte';

    const mouseControlButtons = [
        {
            name: 'top-left',
            textContent: '↖',
            x: -1,
            y: -1,
        },
        {
            name: 'top',
            textContent: '↑',
            x: 0,
            y: -1,
        },
        {
            name: 'top-right',
            textContent: '↗',
            x: 1,
            y: -1,
        },
        {
            name: 'left',
            textContent: '<-',
            x: -1,
            y: 0,
        },
        {
            name: 'right',
            textContent: '->',
            x: 1,
            y: 0,
        },
        {
            name: 'bottom-left',
            textContent: '↙',
            x: -1,
            y: 1,
        },
        {
            name: 'bottom',
            textContent: '↓',
            x: 0,
            y: 1,
        },
        {
            name: 'bottom-right',
            textContent: '↘',
            x: 1,
            y: 1,
        },
    ];

    function emulateClick() {
        postData({ mouse: { type: 'click', button: 'left', double: false } });
    }
</script>

<div>
    {#each mouseControlButtons as { name, textContent, x, y }}
        <ChangeMouseBtn {postData} {name} {textContent} {x} {y} />
    {/each}
    <button on:click={emulateClick} />
</div>

<style>
    div {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(3, 1fr);

        grid-template-areas:
            'top-left top top-right'
            'left click right'
            'bottom-left bottom bottom-right';

        grid-gap: 20px;
        width: 300px;
        height: 300px;
        padding: 50px 0;
        margin: auto;
    }

    button {
        background-color: var(--blue-1);
        font-size: 28px;
        border-radius: 50%;
        grid-area: click;
    }
</style>
