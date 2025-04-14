/* eslint-disable no-var */

import type { AudioLayer } from '@vknext/shared/vkcom/types';

export interface stManager {
	add(statics: string | string[]): Promise<void>;
}

export interface NotifierEvent {
	text?: string;
	title?: string;
	baloonEl?: HTMLElement;
	closeTO?: number;
	fadeTO?: number;
	startFading?: () => void;
}

export interface Notifier {
	showEvent(event: NotifierEvent): void;
	hideEvent(event: NotifierEvent): void;
}

interface VKNext {
	vms_installed?: boolean;
}

interface AudioPlayer {
	getCurrentAudio: () => any[] | null;
	on: (unk1: any, type: 'update' | any, callback: (event: any) => void) => () => void;
}

declare global {
	var browser: typeof globalThis.chrome;

	var vknext: VKNext;

	var Notifier: Notifier;
	var audioLayer: AudioLayer;
	var stManager: stManager;
	var jsc: (module: string) => string;
	var stDeps: { [script: string]: string[] };
	var showTooltip: (el: HTMLElement, opts: Record<string, any>) => void;

	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: 'development' | 'production';
		}
	}
}

export interface ObservedHTMLElement extends HTMLElement {
	_vms_mbs?: MutationObserver;
	_vms_ibs?: IntersectionObserver;
	[key: `_vms_mbs_${string}`]: MutationObserver;
	[key: `_vms_ibs_${string}`]: IntersectionObserver;
	[key: `_vms_${string}`]: unknown;
}
