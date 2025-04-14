/* eslint-disable */
import * as Objects from './objects';

export type AudioGetByIdResponse = Objects.AudioAudio[];

export type AudioGetPlaylistByIdResponse = Objects.AudioPlaylist;

export interface AudioGetResponse {
	/**
	 * Total number
	 */
	count: number;
	items: Objects.AudioAudio[];
	profiles?: Objects.UsersUserFull[];
	groups?: Objects.GroupsGroupFull[];
}

export type UsersGetResponse = Objects.UsersUserFull[];
