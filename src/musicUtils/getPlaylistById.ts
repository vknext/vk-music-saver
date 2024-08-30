import { AudioPlaylist } from 'src/schemas/objects';
import { AudioGetParams, AudioGetPlaylistByIdParams } from 'src/schemas/params';
import { AudioGetResponse } from 'src/schemas/responses';

interface OldPlaylist {
	type: 'playlist';
	ownerId: number;
	id: number;
	isOfficial: number;
	title: string;
	titleLang: number;
	subTitle: string | null;
	description: string;
	rawDescription: string;
	authorName: string;
	lastUpdated: number;
	listens: string;
	coverUrl: string;
	isFollowed: boolean;
	followHash: string;
	accessHash: string;
	isBlocked: string;
	expire: number;
	list: any[];
	hasMore: number;
	nextOffset: number;
	totalCount: number;
	totalCountHash: string;
	is_generated_playlist: boolean;
	is_exclusive: boolean;
	noDiscover: boolean | null;
}

export const getPlaylistById = async (params: AudioGetPlaylistByIdParams): Promise<AudioPlaylist | null> => {
	try {
		const [playlist]: [OldPlaylist] = await window.ajax.promisifiedPost('/al_audio.php?act=load_section', {
			access_hash: params.access_key || '',
			al: '1',
			claim: '0',
			is_loading_all: '0',
			is_preload: '0',
			offset: '0',
			owner_id: params.owner_id,
			playlist_id: params.playlist_id,
			type: 'playlist',
		});

		if (!playlist) return null;

		const audios = await window.vkApi.api<AudioGetParams, AudioGetResponse>('audio.get', {
			owner_id: playlist.ownerId,
			playlist_id: playlist.id,
			access_key: params.access_key,
			count: 10000,
		});

		const audioPlaylist: AudioPlaylist = {
			id: playlist.id,
			owner_id: playlist.ownerId,
			title: playlist.title,
			description: playlist.rawDescription,
			type: 0,
			count: playlist.totalCount || playlist.list?.length || 0,
			followers: 0,
			no_discover: Boolean(playlist.noDiscover),
			plays: 0,
			create_time: playlist.lastUpdated,
			update_time: playlist.lastUpdated,
			audios: audios.items,
			subtitle: `${playlist.subTitle || ''}`,
			main_artists: playlist.authorName.split(',').map((name) => {
				return { name: name.trim() };
			}),
			coverUrl_l: playlist.coverUrl,
		};

		return audioPlaylist;
	} catch (e) {
		console.error(e);
	}

	return null;
};

export default getPlaylistById;
