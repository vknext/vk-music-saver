import type { PickByType } from 'src/types/PickByType';
import type { AudioConvertMethod, DownloadFilesMethod } from './enums';

export interface GlobalStorageBaseValues {
	num_tracks_in_playlist: boolean;
	download_files_method: DownloadFilesMethod;
	audio_convert_method: AudioConvertMethod;
	onboarding_settings_hint_seen: boolean;
	single_track_template: string;
	playlist_track_template: string;
	audio_write_id3_tags: boolean;
	audio_write_genius_lyrics: boolean;
	downloaded_tracks_count: number;
	downloaded_playlists_count: number;
	rate_extension_alert_shown: boolean;
	donut_alert_shown: boolean;
	download_playlist_in_reverse: boolean;
	add_leading_zeros: boolean;
	[key: `params_${number}`]: string | null;
	vmp_onboarding_shown: boolean;
	subscribe_alert_shown: boolean;
}

export type GlobalStorageBaseKeys = keyof GlobalStorageBaseValues;

export type GlobalStorageBooleanValues = PickByType<GlobalStorageBaseValues, boolean>;
export type GlobalStorageBooleanKeys = keyof GlobalStorageBooleanValues;
