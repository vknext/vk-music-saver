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

export interface AudioGetAudioIdsBySourceResponse {
	audios: Objects.AudioAudioRawIdTracked[];
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

export interface AppsGetAppLaunchParamsResponse {
	vk_access_token_settings?: string;
	vk_app_id?: number;
	vk_are_notifications_enabled?: number;
	vk_is_app_user?: number;
	vk_is_favorite?: number;
	vk_language?: string;
	vk_platform?: string;
	vk_ref?: string;
	vk_ts?: number;
	/**
	 * user id
	 */
	vk_user_id?: number;
	sign?: string;
	vk_viewer_group_role?: string;
	vk_group_id?: number;
	vk_experiment?: string;
	vk_has_profile_button?: number;
	vk_profile_id?: number;
	vk_is_recommended?: number;
	vk_is_employee?: number;
	vk_mode?: string;
	vk_seg?: number;
	vk_h3?: number;
	vk_client?: string;
	vk_restrictions?: number;
}
