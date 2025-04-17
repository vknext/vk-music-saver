import type { PickByType } from 'src/types/PickByType';
import type { AudioConvertMethod, DownloadFilesMethod } from './enums';

export interface GlobalStorageBaseValues {
	numTracksInPlaylist: boolean;
	downloadMethod: DownloadFilesMethod;
	audioConvertMethod: AudioConvertMethod;
	[key: `view_url_${number}`]: string | null;
}

export type GlobalStorageBaseKeys = keyof GlobalStorageBaseValues;

export type GlobalStorageBooleanValues = PickByType<GlobalStorageBaseValues, boolean>;
export type GlobalStorageBooleanKeys = keyof GlobalStorageBooleanValues;
