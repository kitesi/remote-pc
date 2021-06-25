import { writable } from 'svelte/store';

export const volume = writable(50);
export const muted = writable(false);
