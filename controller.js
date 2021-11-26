// @ts-check
// the package loudness uses amixer internally, but I need the arguments `-D pulse` for amixer to work

import loudness from 'loudness';
import { execa } from 'execa';

const reInfo =
    /[a-z][a-z ]*: Playback [0-9-]+ \[([0-9]+)%\] (?:[[0-9.-]+dB\] )?\[(on|off)\]/i;

function parseInfo(data) {
    const result = reInfo.exec(data);

    if (result === null) {
        throw new Error('Alsa Mixer Error: failed to parse output');
    }

    return { volume: parseInt(result[1], 10), muted: result[2] === 'off' };
}

/** @param {number} volume */
async function setVolume(volume) {
    if (process.platform !== 'linux') {
        return loudness.setVolume(volume);
    }

    return await execa('amixer', [
        '-D',
        'pulse',
        'set',
        'Master',
        volume + '%',
    ]);
}

/** @param {boolean} muted */
async function setMuted(muted) {
    if (process.platform !== 'linux') {
        return loudness.setMuted(muted);
    }

    return await execa('amixer', [
        '-D',
        'pulse',
        'set',
        'Master',
        muted ? 'off' : 'on',
    ]);
}

async function getVolume() {
    if (process.platform === 'linux') {
        return loudness.getVolume();
    }

    return await parseInfo(
        (
            await execa('amixer', ['-D', 'pulse', 'get', 'Master'])
        ).stdout
    ).volume;
}

async function getMuted() {
    if (process.platform === 'linux') {
        return loudness.getMuted();
    }

    return await parseInfo(
        (
            await execa('amixer', ['-D', 'pulse', 'get', 'Master'])
        ).stdout
    ).muted;
}

export { setVolume, setMuted, getVolume, getMuted };
