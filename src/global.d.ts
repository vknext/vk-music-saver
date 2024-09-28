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
	lang: number;
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

export type PVCurPhotoSizeArray = [string, number, number];

export interface CUR {
	viewAsBox?: () => void;
	pid: number;
	oid: number;
	pvListId: string;
	pvIndex: number;
	pvShown: boolean;
	pvPhoto: HTMLDivElement;
	pvMoreActionsTooltip: {
		_opts: {
			delay: number;
			offset: number[];
			type: number;
			id: string;
			cls: string;
			width: null | number;
			appendToParent: boolean;
			autoAdjustToViewport: boolean;
			autoShow: boolean;
			autoHide: boolean;
			noHideOnClick: boolean;
			arrowSize: string;
			customShow: boolean;
			align: string;
			withCloseButton: boolean;
			forceSide: string;
			elClassWhenShown: string;
			content: string;
			defaultSide: string;
		};
		_arrowSize: number;
		_visTO: boolean;
		_sto: boolean;
		_hto: boolean;
		_reTimeout: boolean;
		_isShown: boolean;
	};
	pvCurPhoto?: {
		id: string;
		base: string;
		commcount: number;
		commshown: number;
		reply_form: string;
		reply_options: {
			rmedia_types: string[][];
		};
		date: string;
		tags: number[];
		album: string;
		author: string;
		author_photo: string;
		author_href: string;
		shares: number;
		likes_tpl: string;
		rotate_hash: string;
		profile_data: {
			useNewForm: string;
			photo: string;
		};
		peType: number;
		peHash: string;
		actions: {
			tag: 1 | 0;
			edit: 1 | 0;
			pe: boolean;
			place: boolean;
			del: 1 | 0;
			rotate: 1 | 0;
			comm: 1 | 0;
			share: boolean;
			prof: 1;
			move: boolean;
			cover: boolean;
		};
		desc: string;
		hash: string;
		attached_tags: {
			max_tags_per_object: number;
			hash: string;
		};
		x_src: string;
		x_: PVCurPhotoSizeArray;
		y_src: string;
		y_: PVCurPhotoSizeArray;
		z_src: string;
		z_: PVCurPhotoSizeArray;
	};
	chooseMedia: (type: string, data: string, params: any) => void;
	editing: string;
	lastAddMedia: {
		menu?: {
			menuNode?: HTMLElement;
		};
		chooseMedia: (type: string, attach: string, options: any) => void;
		checkURL: (url: string, maxCharacters: number, obj: object) => void;
		onChange: any;
	};
	menuSettings: { [key: string]: { [key: string]: 1 | 0 } };
	imClassicInterface: boolean;
	module: string;
	peer: number;
	gid: number;
	moreFrom?: string;
	storyLayer?: {
		activeStory: {
			authorImg: HTMLImageElement;
			contStickers: HTMLDivElement;
			curPreviewUrl: string;
			story: {
				data: {
					id: number;
					owner_id: number;
					raw_id: string;
				} & ({ type: 'photo'; photo_url: string } | { type: 'video'; video_url: string });
				photo?: HTMLElement;
				video?: HTMLElement;
			};
			data: {
				id: string;
				authorId: string;
				story: {
					raw_id: string;
				};
			};
			actionButtons: HTMLDivElement;
		};
		stories: HTMLElement;
	};
	pvBottomActions?: HTMLDivElement;
	owner?: {
		id: number;
		name: string;
		photo: string;
	};
	lang?: Record<string, any>;
}

interface UIActionsMenu {
	show(element: HTMLElement, idk?: unknown, options?: { delay?: number }): void;
	hide(element: HTMLElement, idk?: unknown, options?: { delay?: number }): void;
	keyToggle(element: HTMLElement | undefined, event: Event): void;
}

declare global {
	var browser: typeof globalThis.chrome;

	var vknext: VKNext;

	var Notifier: Notifier;
	var AudioUtils: AudioUtils;
	var vk: VK;
	var nav: Nav;
	var vkApi: IvkApi;
	var ajax: Iajax;
	var audioLayer: AudioLayer;
	var stManager: stManager;
	var jsc: (module: string) => string;
	var stDeps: { [script: string]: string[] };
	var ap: AudioPlayer;
	var getAudioPlayer: () => AudioPlayer;
	var cur: CUR;
	var uiActionsMenu: UIActionsMenu;

	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: 'development' | 'production';
		}
	}
}
