/* eslint-disable no-var */

import { AudioArtist } from './schemas/objects';

interface navGoLoc {
	0?: string;
	sel?: string;
	msgid?: number;
	section?: string;
	source?: string | number;
	cmid?: string;
	/**
	 * модалки
	 */
	z?: string;
	/**
	 * профиль в мессенджере
	 */
	rp?: string;
}

interface navGoLocProps extends navGoLoc {
	act?: string;
	z?: string;
	modal?: string;
	rp?: string;
	invite_link?: string;
	invite_chat_id?: string;
	chat?: string;
}

export interface VK {
	id: number;
}

export interface Iajax {
	enabled: boolean;
	post(url: string, obj: any, func?: any): any;
	promisifiedPost<T = any>(url: string, obj: Record<string, any>): Promise<T>;
}

export interface stManager {
	add(statics: string | string[]): Promise<void>;
}

export interface NotifierEvent {
	text?: string;
}

export interface Notifier {
	showEvent(event: NotifierEvent): void;
}

export interface AudioObject {
	hashes?: string;
	id: number;
	owner_id: number;
	ownerId: number;
	fullId: string;
	title: string;
	subTitle: string;
	performer: string;
	mainArtists: Pick<AudioArtist, 'id' | 'name'>[] | string;

	featArtists: string;
	authorLink: string;
	duration: number;
	lyrics: 1 | 0;
	url: string;
	context: string;
	extra: string;
	accessKey: string;
	addHash: string;
	editHash: string;
	actionHash: string;
	deleteHash: string;
	replaceHash: string;
	urlHash: string;
	restoreHash: string;
	canEdit: boolean;
	canDelete: boolean;
	flags: number;
	isOriginalSound: boolean;
	hasLyrics: boolean;
	isLongPerformer: boolean;
	isClaimed: boolean;
	isFromQueue: boolean;
	isExplicit: boolean;
	isUMA: boolean;
	isReplaceable: boolean;
	canAdd: boolean;
	showInfo: boolean;
	coverUrl_s: string;
	coverUrl_p: string;
	coverUrl_l: string;
	hasTrackPage: boolean;
	trackPageId: string;
	ads: {
		duration: number;
		content_id: string;
		puid22: number;
		account_age_type: number;
		_SITEID: number;
		vk_id: number;
		ver: number;
	};
	album: [number, number, string];
	albumId: number;
	albumPart: number;
	trackCode: string;
	restrictionStatus: number;
	chartInfo: boolean;
	adminUrl: string;
	umaQueryUrl: string;

	[key: string]: any;
}

export interface AudioUtils {
	onRowOver: (audioNode: HTMLElement, event: MouseEvent) => unknown;
	audioTupleToAudioObject: (audio: any[] | null) => AudioObject | null;
	[key: string]: any;
}

export interface IvkApi {
	api<P = Record<string, any>, R = any>(
		method: string,
		params: P,
		m?: {
			grouping?: boolean;
		},
		signal?: {
			signal: AbortSignal;
		}
	): Promise<R>;
}

interface VKNext {
	vms_installed?: boolean;
}

export interface Nav {
	removeNavigationStartListener: (callback: (locStr: string) => void) => void;
	subscribeOnModuleEvaluated: (callback: () => void, once?: boolean) => void;
	unsubscribeOnModuleEvaluated: (callback: () => void) => void;
	strLoc: string;
	toStr(string: navGoLocProps): string;
	fromStr(string: string): navGoLocProps;
	objLoc: navGoLocProps;
	setLoc(loc: navGoLocProps): void;
	go(loc: navGoLoc | string, ev?: string | null | Event, opts?: Record<string, any>): void;
	change: (loc: navGoLoc, ev?: string | null, opts?: Record<string, any>) => void;
	onLocationChange: (handler: (locStr: string) => unknown) => () => void;
	addNavigationStartListener: (handler: (locStr: string) => unknown) => () => void;
}

export interface AudioLayer {
	_initSection?: string;
	_els?: {
		layerPlace: HTMLElement;
		topNotaBtn: HTMLElement;
		topNotaBtnGroup: HTMLElement;
		topPlayBtn: HTMLButtonElement;
		container?: HTMLElement;

		tooltip: {
			show: () => void;
		};
	};
}

interface AudioPlayer {
	getCurrentAudio: () => any[] | null;
	on: (unk1: any, type: 'update' | any, callback: (event: any) => void) => () => void;
}

declare global {
	var vknext: VKNext;

	var Notifier: Notifier;
	var AudioUtils: AudioUtils;
	var vk: VK;
	var nav: Nav;
	var vkApi: IvkApi;
	var ajax: Iajax;
	var audioLayer: AudioLayer;
	var getLang: (key: string, type?: string | number) => string;
	var stManager: stManager;
	var jsc: (module: string) => string;
	var stDeps: { [script: string]: string[] };
	var ap: AudioPlayer;
	var getAudioPlayer: () => AudioPlayer;

	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: 'development' | 'production';
		}
	}
}
