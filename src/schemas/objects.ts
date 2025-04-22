/* eslint-disable */
export type BaseBoolInt = 0 | 1;

export interface UsersUserMin {
	deactivated?: string;
	first_name: string;
	hidden?: number;
	id: number;
	last_name: string;
	can_access_closed?: boolean;
	is_closed?: boolean;
}

export type BaseSex = 0 | 1 | 2;

export interface UsersOnlineInfo {
	/**
	 * Whether you can see real online status of user or not
	 */
	visible?: boolean | number;
	/**
	 * Last time we saw user being active
	 */
	last_seen?: number;
	/**
	 * Whether user is currently online or not
	 */
	is_online?: boolean | number;
	/**
	 * Application id from which user is currently online or was last seen online
	 */
	app_id?: number;
	/**
	 * Is user online from desktop app or mobile app
	 */
	is_mobile?: boolean | number;
	/**
	 * In case user online is not visible, it indicates approximate timeframe of user online
	 */
	status?: 'recently' | 'last_week' | 'last_month' | 'long_ago' | 'not_show';
	[key: string]: any;
}

export type FriendsFriendStatusStatus = 0 | 1 | 2 | 3;

export interface FriendsRequestsMutual {
	/**
	 * Total mutual friends number
	 */
	count?: number;
	/**
	 * User ID
	 */
	users?: number[];
	[key: string]: any;
}

export interface UsersUser extends UsersUserMin {
	/**
	 * User sex
	 */
	sex?: BaseSex;
	/**
	 * Domain name of the user's page
	 */
	screen_name?: string;
	/**
	 * URL of square photo of the user with 50 pixels in width
	 */
	photo_50?: string;
	/**
	 * URL of square photo of the user with 100 pixels in width
	 */
	photo_100?: string;
	/**
	 * Application ID
	 */
	online_app?: number;
	online_info?: UsersOnlineInfo;
	online?: BaseBoolInt;
	online_mobile?: BaseBoolInt;
	verified?: BaseBoolInt;
	trending?: BaseBoolInt;
	friend_status?: FriendsFriendStatusStatus;
	mutual?: FriendsRequestsMutual;
	/**
	 * User photo (avatar) avg color
	 */
	photo_avg_color?: string;
}

export interface BaseImage {
	/**
	 * Image url
	 */
	url: string;
	/**
	 * Image width
	 */
	width: number;
	/**
	 * Image height
	 */
	height: number;
	theme?: string;
	[key: string]: any;
}

export interface GroupsGroup {
	/**
	 * Community ID
	 */
	id: number;
	/**
	 * Community name
	 */
	name: string;
	/**
	 * Domain of the community page
	 */
	screen_name?: string;
	/**
	 * Start date in Unixtime format
	 */
	start_date?: number;
	/**
	 * Finish date in Unixtime format
	 */
	finish_date?: number;
	/**
	 * Information whether community is banned
	 */
	deactivated?: string;
	/**
	 * URL of square photo of the community with 50 pixels in width
	 */
	photo_50?: string;
	/**
	 * URL of square photo of the community with 100 pixels in width
	 */
	photo_100?: string;
	/**
	 * URL of square photo of the community with 200 pixels in width
	 */
	photo_200?: string;
	/**
	 * URL of square photo of the community with 200 pixels in width original
	 */
	photo_200_orig?: string;
	/**
	 * URL of square photo of the community with 400 pixels in width
	 */
	photo_400?: string;
	/**
	 * URL of square photo of the community with 400 pixels in width original
	 */
	photo_400_orig?: string;
	/**
	 * URL of square photo of the community with max pixels in width
	 */
	photo_max?: string;
	/**
	 * URL of square photo of the community with max pixels in width original
	 */
	photo_max_orig?: string;
	/**
	 * Established date
	 */
	est_date?: string;
	/**
	 * Public date label
	 */
	public_date_label?: string;
	[key: string]: any;
}

export interface GroupsGroupFull1 {
	/**
	 * Community description
	 */
	description: string;
	/**
	 * Community's main wiki page title
	 */
	wiki_page: string;
	/**
	 * Community members number
	 */
	members_count: number;
	/**
	 * Info about number of users in group
	 */
	members_count_text: string;
	/**
	 * The number of incoming requests to the community
	 */
	requests_count: number;
	/**
	 * Community level live streams achievements
	 */
	video_live_level: number;
	/**
	 * Number of community's live streams
	 */
	video_live_count: number;
	/**
	 * Number of community's clips
	 */
	clips_count: number;
	/**
	 * Type of group, start date of event or category of public page
	 */
	activity: string;
	/**
	 * Fixed post ID
	 */
	fixed_post: number;
	/**
	 * Community status
	 */
	status: string;
	/**
	 * Community's main photo album ID
	 */
	main_album_id: number;
	/**
	 * Information about wall status in community
	 */
	wall: 0 | 1 | 2 | 3;
	/**
	 * Community's website
	 */
	site: string;
	/**
	 * Inviter ID
	 */
	invited_by: number;
	/**
	 * Information whether community has installed market app
	 */
	has_market_app: boolean | number;
	/**
	 * Information whether current user is subscribed to podcasts
	 */
	is_subscribed_podcasts: boolean | number;
	/**
	 * Owner in whitelist or not
	 */
	can_subscribe_podcasts: boolean | number;
	/**
	 * Can subscribe to wall
	 */
	can_subscribe_posts: boolean | number;
}

export type GroupsGroupFull = GroupsGroup & GroupsGroupFull1;

export interface AudioAudioAlbum {
	/**
	 * Album ID
	 */
	id: number;
	/**
	 * Album title
	 */
	title: string;
	/**
	 * Album owner's ID
	 */
	owner_id: number;
	/**
	 * Album access key
	 */
	access_key: string;

	[key: string]: any;
}

export interface AudioArtist {
	/**
	 * Artist domain
	 */
	domain?: string;
	/**
	 * Artist ID
	 */
	id?: string;
	/**
	 * Mark shows that artist has no official cover, last album thumb is used instead
	 */
	is_album_cover?: boolean;
	/**
	 * Artist name
	 */
	name: string;
	/**
	 * Artist photos
	 */
	photo?: BaseImage[];
	/**
	 * Is user follow this artist
	 */
	is_followed?: boolean;
	/**
	 * Can be this artist followed by user
	 */
	can_follow?: boolean;
	can_play?: boolean;
	/**
	 * Artist genres
	 */
	genres?: AudioGenre[];
	/**
	 * Artist bio
	 */
	bio?: string;
	/**
	 * Artist pages
	 */
	pages?: number[];
	profiles?: UsersUser[];
	groups?: GroupsGroupFull[];
	track_code?: string;
}

export interface AudioAudio {
	/**
	 * Access key for the audio
	 */
	access_key?: string;
	/**
	 * Artist name
	 */
	artist: string;
	/**
	 * Audio ID
	 */
	id: number;
	/**
	 * Audio owner's ID
	 */
	owner_id: number;
	is_explicit?: boolean;
	is_focus_track?: boolean;
	is_licensed?: boolean;
	/**
	 * Title
	 */
	title?: string;
	track_code?: string;
	/**
	 * URL of mp3 file
	 */
	url?: string;
	/**
	 * Duration in seconds
	 */
	duration: number;
	/**
	 * Date when uploaded
	 */
	date?: number;
	/**
	 * Album ID
	 */
	album_id?: number;
	/**
	 * has lyrics
	 */
	has_lyrics?: boolean;
	genre_id?: number;
	no_search?: BaseBoolInt;
	/**
	 * Audio album
	 */
	album?: AudioAudioAlbum;
	/**
	 * Release ID
	 */
	release_id?: number;
	/**
	 * Main artists
	 */
	main_artists?: AudioArtist[];
	/**
	 * Featured artists
	 */
	featured_artists?: AudioArtist[];
	subtitle?: string;
	/**
	 * Audio album part number
	 */
	album_part_number?: number;
	/**
	 * Performer name
	 */
	performer?: string;
	original_sound_video_id?: string;
	short_videos_allowed?: boolean;
	stories_allowed?: boolean;
	stories_cover_allowed?: boolean;
	/**
	 * Is audio UGC and has DMCA block
	 */
	dmca_blocked?: boolean;
	is_official?: boolean;

	[key: string]: any;
}

export interface AudioGenre {
	/**
	 * Genre ID
	 */
	id: number;
	/**
	 * Genre name
	 */
	name: string;
}

export interface AudioPlaylist {
	/**
	 * Playlist ID
	 */
	id: number;
	/**
	 * Playlist owner ID
	 */
	owner_id: number;
	/**
	 * Original or followed playlist ID
	 */
	playlist_id?: number;
	/**
	 * Playlist type
	 */
	type: number;
	/**
	 * Playlist title
	 */
	title: string;
	/**
	 * Playlist description
	 */
	description: string;
	/**
	 * Playlist genres
	 */
	genres?: AudioGenre[];
	/**
	 * Playlist tracks count
	 */
	count: number;
	/**
	 * Is user follow this playlist
	 */
	is_following?: boolean;
	/**
	 * Playlist followers count
	 */
	followers: number;
	/**
	 * If playlist should be hidden from search results and recommendations
	 */
	no_discover?: boolean;
	/**
	 * Playlist plays count
	 */
	plays: number;
	/**
	 * Playlist create time
	 */
	create_time: number;
	/**
	 * Playlist upload time
	 */
	update_time: number;
	/**
	 * Playlist audios
	 */
	audios?: AudioAudio[];
	/**
	 * Whether playlist exists on curator page
	 */
	is_curator?: boolean;
	/**
	 * Playlist year
	 */
	year?: number;
	/**
	 * Should show badge near playlist subtitle
	 */
	subtitle_badge?: boolean;
	/**
	 * Should show playlist play button on cover
	 */
	play_button?: boolean;
	/**
	 * Playlist access key
	 */
	access_key?: string;
	/**
	 * UMA playlist ID
	 */
	uma_album_id?: number;
	/**
	 * Playlist subtitle
	 */
	subtitle?: string;
	/**
	 * Playlist original year
	 */
	original_year?: number;
	/**
	 * Is playlist exist
	 */
	is_explicit?: boolean;
	/**
	 * Playlist artists
	 */
	artists?: AudioArtist[];
	/**
	 * Playlist main artists
	 */
	main_artists?: AudioArtist[];
	/**
	 * Playlist main artist name
	 */
	main_artist?: string;
	/**
	 * Playlist featured artists
	 */
	featured_artists?: AudioArtist[];
	/**
	 * Playlist type
	 */
	album_type?: string;
	track_code?: string;
	/**
	 * percent of fit
	 */
	match_score?: number;
	/**
	 * Audios total file size after download
	 */
	audios_total_file_size?: number;
	[key: string]: any;
}

export type BaseUserGroupFields =
	| 'about'
	| 'action_button'
	| 'activities'
	| 'activity'
	| 'addresses'
	| 'admin_level'
	| 'age_limits'
	| 'author_id'
	| 'ban_info'
	| 'bdate'
	| 'blacklisted'
	| 'blacklisted_by_me'
	| 'books'
	| 'can_create_topic'
	| 'can_message'
	| 'can_post'
	| 'can_see_all_posts'
	| 'can_see_audio'
	| 'can_send_friend_request'
	| 'can_upload_video'
	| 'can_write_private_message'
	| 'career'
	| 'city'
	| 'common_count'
	| 'connections'
	| 'contacts'
	| 'counters'
	| 'country'
	| 'cover'
	| 'crop_photo'
	| 'deactivated'
	| 'description'
	| 'domain'
	| 'education'
	| 'exports'
	| 'finish_date'
	| 'fixed_post'
	| 'followers_count'
	| 'friend_status'
	| 'games'
	| 'has_market_app'
	| 'has_mobile'
	| 'has_photo'
	| 'home_town'
	| 'id'
	| 'interests'
	| 'is_admin'
	| 'is_closed'
	| 'is_favorite'
	| 'is_friend'
	| 'is_hidden_from_feed'
	| 'is_member'
	| 'is_messages_blocked'
	| 'can_send_notify'
	| 'is_subscribed'
	| 'last_seen'
	| 'links'
	| 'lists'
	| 'maiden_name'
	| 'main_album_id'
	| 'main_section'
	| 'market'
	| 'member_status'
	| 'members_count'
	| 'military'
	| 'movies'
	| 'music'
	| 'name'
	| 'nickname'
	| 'occupation'
	| 'online'
	| 'online_status'
	| 'personal'
	| 'phone'
	| 'photo_100'
	| 'photo_200'
	| 'photo_200_orig'
	| 'photo_400_orig'
	| 'photo_50'
	| 'photo_id'
	| 'photo_max'
	| 'photo_max_orig'
	| 'quotes'
	| 'relation'
	| 'relatives'
	| 'schools'
	| 'screen_name'
	| 'sex'
	| 'site'
	| 'start_date'
	| 'status'
	| 'timezone'
	| 'trending'
	| 'tv'
	| 'type'
	| 'universities'
	| 'verified'
	| 'wall_comments'
	| 'wiki_page'
	| 'first_name'
	| 'first_name_acc'
	| 'first_name_dat'
	| 'first_name_gen'
	| 'last_name'
	| 'last_name_acc'
	| 'last_name_dat'
	| 'last_name_gen'
	| 'can_subscribe_stories'
	| 'is_subscribed_stories'
	| 'vk_admin_status'
	| 'is_nft'
	| 'is_esia_verified'
	| 'is_sber_verified'
	| 'is_tinkoff_verified'
	| 'image_status';

export interface UsersUserFull extends UsersUser {
	/**
	 * User's first name in nominative case
	 */
	first_name_nom?: string;
	/**
	 * User's first name in genitive case
	 */
	first_name_gen?: string;
	/**
	 * User's first name in dative case
	 */
	first_name_dat?: string;
	/**
	 * User's first name in accusative case
	 */
	first_name_acc?: string;
	/**
	 * User's first name in instrumental case
	 */
	first_name_ins?: string;
	/**
	 * User's first name in prepositional case
	 */
	first_name_abl?: string;
	/**
	 * User's last name in nominative case
	 */
	last_name_nom?: string;
	/**
	 * User's last name in genitive case
	 */
	last_name_gen?: string;
	/**
	 * User's last name in dative case
	 */
	last_name_dat?: string;
	/**
	 * User's last name in accusative case
	 */
	last_name_acc?: string;
	/**
	 * User's last name in instrumental case
	 */
	last_name_ins?: string;
	/**
	 * User's last name in prepositional case
	 */
	last_name_abl?: string;
	/**
	 * User nickname
	 */
	nickname?: string;
	/**
	 * User maiden name
	 */
	maiden_name?: string;
	/**
	 * User contact name
	 */
	contact_name?: string;
	/**
	 * Domain name of the user's page
	 */
	domain?: string;
	/**
	 * User's date of birth
	 */
	bdate?: string;
	bdate_visibility?: number;
	/**
	 * User's timezone
	 */
	timezone?: number;
	/**
	 * URL of square photo of the user with 200 pixels in width
	 */
	photo_200?: string;
	/**
	 * URL of square photo of the user with maximum width
	 */
	photo_max?: string;
	/**
	 * URL of user's photo with 200 pixels in width
	 */
	photo_200_orig?: string;
	/**
	 * URL of user's photo with 400 pixels in width
	 */
	photo_400_orig?: string;
	/**
	 * URL of user's photo of maximum size
	 */
	photo_max_orig?: string;
	/**
	 * ID of the user's main photo
	 */
	photo_id?: string;
	/**
	 * Information whether current user can call
	 */
	can_call?: boolean | number;
	/**
	 * Information whether group can call user
	 */
	can_call_from_group?: boolean | number;
	/**
	 * Information whether current user can see the user's wishes
	 */
	can_see_wishes?: boolean | number;
	/**
	 * Information whether current user can be invited to the community
	 */
	can_be_invited_group?: boolean | number;
	/**
	 * User's mobile phone number
	 */
	mobile_phone?: string;
	/**
	 * User's additional phone number
	 */
	home_phone?: string;
	/**
	 * User's website
	 */
	site?: string;
	/**
	 * User's status
	 */
	status?: string;
	/**
	 * User's status
	 */
	activity?: string;
	/**
	 * Number of user's followers
	 */
	followers_count?: number;
	/**
	 * User level in live streams achievements
	 */
	video_live_level?: number;
	/**
	 * Number of user's live streams
	 */
	video_live_count?: number;
	/**
	 * Number of user's clips
	 */
	clips_count?: number;
	/**
	 * Number of common friends with current user
	 */
	common_count?: number;
	/**
	 * University ID
	 */
	university?: number;
	/**
	 * University name
	 */
	university_name?: string;
	/**
	 * Faculty ID
	 */
	faculty?: number;
	/**
	 * Faculty name
	 */
	faculty_name?: string;
	/**
	 * Graduation year
	 */
	graduation?: number;
	/**
	 * Education form
	 */
	education_form?: string;
	/**
	 * User's education status
	 */
	education_status?: string;
	/**
	 * User hometown
	 */
	home_town?: string;
	/**
	 * Information whether current user is subscribed to podcasts
	 */
	is_subscribed_podcasts?: boolean | number;
	/**
	 * Owner in whitelist or not
	 */
	can_subscribe_podcasts?: boolean | number;
	/**
	 * Can subscribe to wall
	 */
	can_subscribe_posts?: boolean | number;
	/**
	 * Access to user profile is restricted for search engines
	 */
	is_no_index?: boolean | number;
	/**
	 * Contact person ID
	 */
	contact_id?: number;
	/**
	 * IDs of friend lists with user
	 */
	lists: number[];
	has_photo: BaseBoolInt;
	has_mobile: BaseBoolInt;
	is_friend: BaseBoolInt;
	wall_comments: BaseBoolInt;
	can_post: BaseBoolInt;
	can_see_all_posts: BaseBoolInt;
	/**
	 * Property show has user avatar as NFT or not
	 */
	is_nft?: boolean;
	is_esia_verified?: number;
	is_tinkoff_verified?: number;
	is_sber_verified?: number;
	/**
	 * Information whether current user is can send question
	 */
	can_ask_question?: boolean;

	is_followers_mode_on?: boolean;
	social_button_type?: string;
	can_invite_to_chats?: boolean;
	no_index?: string;
	is_dead?: number;
	is_subscribed?: number;
	is_subscribed_stories?: boolean;
	can_subscribe_stories?: boolean;
	can_ban?: boolean;
}

export interface MessagesConversationPeer {
	[key: string]: any;
	id: number;
	local_id?: number;
	type: MessagesConversationPeerType;
}

export type MessagesConversationPeerType = 'chat' | 'email' | 'user' | 'group';

export interface MessagesChatSettingsPhoto {
	/**
	 * URL of the preview image with 50px in width
	 */
	photo_50?: string;
	/**
	 * URL of the preview image with 100px in width
	 */
	photo_100?: string;
	/**
	 * URL of the preview image with 200px in width
	 */
	photo_200?: string;
	/**
	 * If provided photo is default
	 */
	is_default_photo?: boolean | number;
	/**
	 * If provided photo is default call photo
	 */
	is_default_call_photo?: boolean | number;
	[key: string]: any;
}

export interface MessagesChatSettings {
	/**
	 * Chat title
	 */
	title: string;
	/**
	 * Admin id
	 */
	admin_ids?: number[];
	/**
	 * Active member ID
	 */
	active_ids?: number[];
	[key: string]: any;
	members_count?: number;
	friends_count?: number;
	owner_id: number;
	is_group_channel?: boolean | number;
	is_disappearing?: boolean | number;
	theme?: string;
	disappearing_chat_link?: string;
	is_service?: boolean | number;
	photo?: MessagesChatSettingsPhoto;
}

export interface MessagesConversation {
	/**
	 * ID of the last message in conversation
	 */
	last_message_id?: number;
	/**
	 * Conversation message ID of the last message in conversation
	 */
	last_conversation_message_id?: number;
	/**
	 * Last message user have read
	 */
	in_read?: number;
	/**
	 * Last outgoing message have been read by the opponent
	 */
	out_read?: number;
	/**
	 * Unread messages number
	 */
	unread_count?: number;
	/**
	 * Is this conversation uread
	 */
	is_marked_unread?: boolean | number;
	/**
	 * Message id of message with mention
	 */
	mentions?: number[];
	important?: boolean | number;
	unanswered?: boolean | number;
	special_service_type?: 'business_notify';
	peer: MessagesConversationPeer;
	chat_settings?: MessagesChatSettings;
}

export interface MessagesGetConversationById {
	/**
	 * Total number
	 */
	count?: number;
	[key: string]: any;
	items: MessagesConversation[];
}

interface MessagesMessageBase {
	type: MessagesMessageAttachmentType;

	[key: string]: any;
}

interface MessagesMessageAttachmentAudio extends MessagesMessageBase {
	type: 'audio';
	audio: AudioAudio;
}

export type MessagesMessageAttachment = MessagesMessageAttachmentAudio;

export type MessagesMessageAttachmentType = 'audio';

export interface MessagesHistoryAttachment {
	/**
	 * Message ID
	 */
	message_id?: number;
	/**
	 * Message author's ID
	 */
	from_id?: number;
	/**
	 * Forward level (optional)
	 */
	forward_level?: number;
	[key: string]: any;
	was_listened?: boolean | number;
	attachment?: MessagesMessageAttachment;
}

export interface AudioAudioRawIdTracked {
	/**
	 * Audio id
	 */
	audio_id: string;
	track_code: string;
}
