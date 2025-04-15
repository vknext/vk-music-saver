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

export type MessagesGetConversationsByIdResponse = Objects.MessagesGetConversationById;

export interface MessagesGetHistoryAttachmentsResponse {
	/**
	 * Value for pagination
	 */
	next_from: string;
	[key: string]: any;
	items: Objects.MessagesHistoryAttachment[];
	profiles: Objects.UsersUserFull[];
	groups: Objects.GroupsGroupFull[];
}
