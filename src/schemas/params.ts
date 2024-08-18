/* eslint-disable */
import * as Objects from './objects';

export interface AudioGetByIdParams {
	/**
	 * Audio file IDs, in the following format: \"{owner_id}_{audio_id}\"
	 */
	audios: string;
	[key: string]: any;
}

export interface AudioGetPlaylistByIdParams {
	owner_id: number;
	playlist_id: number;
	access_key?: string;
	track_count?: number;
	ref?: string;
	[key: string]: any;
}

export interface AudioGetParams {
	/**
	 * ID of the user or community that owns the audio file. Use a negative value to designate a community ID.
	 */
	owner_id?: number;
	playlist_id?: number;
	/**
	 * IDs of the audio files to return.
	 */
	audio_ids?: number[];
	/**
	 * '1' — to return information about users who uploaded audio files
	 */
	need_user?: boolean | 1;
	shuffle_seed?: number;
	/**
	 * Offset needed to return a specific subset of audio files.
	 */
	offset?: number;
	/**
	 * Number of audio files to return.
	 */
	count?: number;
	extended?: boolean;
	fields?: Objects.BaseUserGroupFields;
	access_key?: string;
	ref?: string;
	photo_sizes?: boolean;
	track_code?: string;
	[key: string]: any;
}
