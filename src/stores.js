// @ts-check
import { writable } from 'svelte/store';

function createVolumeStore() {
    const store = writable(50);

    return {
        subscribe: store.subscribe,
        set: store.set,
        /** @param {number} change */
        update(change) {
            /** @type {boolean} */
            let hasChanged;

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

export const volume = createVolumeStore();
export const muted = writable(false);
