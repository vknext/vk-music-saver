import type { PickByType } from 'src/types/PickByType';
import type { AudioConvertMethod, DownloadFilesMethod } from './enums';

export interface GlobalStorageBaseValues {
	numTracksInPlaylist: boolean;
	downloadMethod: DownloadFilesMethod;
	audioConvertMethod: AudioConvertMethod;
	onboarding_settings_hint_seen: boolean;
	single_track_template: string;
	playlist_track_template: string;
	[key: `view_url_${number}`]: string | null;
}

export type GlobalStorageBaseKeys = keyof GlobalStorageBaseValues;

export type GlobalStorageBooleanValues = PickByType<GlobalStorageBaseValues, boolean>;
export type GlobalStorageBooleanKeys = keyof GlobalStorageBooleanValues;
