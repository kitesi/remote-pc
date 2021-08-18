// import path from 'path';
// import os from 'os';
// import { readFile } from 'fs/promises';

interface Config {
    keyShortcuts: {
        text: string;
        key: string;
    }[];
    mouseSensitivity: {
        max: number;
        min: number;
        step: number;
    };
}

// const homedir = os.homedir();
// let configPath = '';

// if (process.platform === 'win32') {
// 	configPath = path.join(homedir, 'remote-pc.json');
// } else if (process.platform === 'darwin') {
// 	configPath = path.join(homedir, 'Library', 'Preferences', 'remote-pc.json');
// } else {
// 	configPath = path.join(
// 		process.env.XDG_DATA_HOME || path.join(homedir, '.config'),
// 		'remote-pc.json'
// 	);
// }

export function getConfig(): Config {
    return {
        keyShortcuts: [
            {
                key: 'enter',
                text: 'Enter',
            },
            {
                key: 'escape',
                text: 'Escape',
            },
            {
                key: 'backspace',
                text: 'Backspace',
            },
            {
                key: 'tab',
                text: 'Tab',
            },
            {
                key: 'left',
                text: '←',
            },
            {
                key: 'right',
                text: '→',
            },
        ],
        mouseSensitivity: {
            min: 10,
            max: 30,
            step: 2,
        },
    };
    // return JSON.parse(readFile(configPath, 'utf-8'));
}
