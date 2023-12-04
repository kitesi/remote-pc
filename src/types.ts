export interface InitialData {
    volume: number;
    muted: boolean;
    canControlKeyboardAndMouse: boolean;
}

export interface PostDataOptions {
    event: 'mouse' | 'keypress' | 'volume-change' | 'mute-change';
    volume?: number;
    muted?: boolean;
    mouse?: {
        type: 'click' | 'drag' | 'move';
        button?: 'left' | 'right';
        double?: boolean;
        x?: number;
        y?: number;
    };
    key?: {
        type: 'tap' | 'type';
        content: string;
        modifiers?: string[];
    };
}

export type PostData = (data: PostDataOptions) => void;

export type SvelteEvent = Event & { detail?: any };
