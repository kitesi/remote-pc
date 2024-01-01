// @ts-check
import { writable } from 'svelte/store';

function createVolumeStore() {
    const store = writable(50);

    return {
        subscribe: store.subscribe,
        set: store.set,
        /** @param {number} change */
        update(change) {
            let hasChanged = false;

            store.update((oldValue) => {
                if (oldValue + change > 100) {
                    hasChanged = oldValue === 100;
                    return 100;
                }

                if (oldValue + change < 0) {
                    hasChanged = oldValue === 0;
                    return 0;
                }

                hasChanged = change !== 0;
                return oldValue + change;
            });

            return hasChanged;
        },
    };
}

export const currentInterval = writable({
    type: '',
    value: setTimeout(() => {}, 0),
});

export const volume = createVolumeStore();
export const muted = writable(false);
