/* eslint-disable no-var */

import type { AudioLayer, MessageBoxObject } from '@vknext/shared/vkcom/types';

export interface stManager {
	add(statics: string | string[]): Promise<void>;
}

interface VKNext {
	vms_installed?: boolean;
}

interface AudioPlayer {
	getCurrentAudio: () => any[] | null;
	on: (unk1: any, type: 'update' | any, callback: (event: any) => void) => () => void;
}

export interface TopMenu {
	show: () => void;
	hide: () => void;
	select: (element: HTMLElement, event: MouseEvent) => boolean;
	toggle: (isShown: boolean) => void;
}

declare global {
	var browser: typeof globalThis.chrome;

	var vknext: VKNext;

	var audioLayer: AudioLayer;
	var stManager: stManager;
	var jsc: (module: string) => string;
	var stDeps: { [script: string]: string[] };
	var showTooltip: (el: HTMLElement, opts: Record<string, any>) => void;
	var TopMenu: TopMenu;
	var _message_boxes: Record<string, MessageBoxObject>;

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
