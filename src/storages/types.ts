import type { PickByType } from 'src/types/PickByType';
import type { DownloadFilesMethod } from './enums';

export interface GlobalStorageBaseValues {
	numTracksInPlaylist: boolean;
	downloadMethod: DownloadFilesMethod;
}

export type GlobalStorageBaseKeys = keyof GlobalStorageBaseValues;

export type GlobalStorageBooleanValues = PickByType<GlobalStorageBaseValues, boolean>;
export type GlobalStorageBooleanKeys = keyof GlobalStorageBooleanValues;
