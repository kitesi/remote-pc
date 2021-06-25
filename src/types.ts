export interface InitialData {
	volume: number;
	muted: boolean;
	isRobotJSInstalled: boolean;
}

export interface PostDataOptions {
	volume?: number;
	muted?: boolean;
	mouse?: {
		type: 'click' | 'drag-mouse' | 'move-mouse';
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
