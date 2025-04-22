import type { AudioPlaylist } from 'src/schemas/objects';
import type { AudioGetPlaylistByIdParams } from 'src/schemas/params';
import type { AudioGetAudioIdsBySourceResponse, AudioGetByIdResponse, AudioGetResponse } from 'src/schemas/responses';

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

const getLargePhotoUrl = (photoData: Record<string, any>): string | undefined => {
	let largestSize = 0;
	let largestUrl: string | undefined;

	for (const [key, url] of Object.entries(photoData)) {
		if (key.startsWith('photo_')) {
			const size = parseInt(key.split('photo_')[1], 10);
			if (size > largestSize) {
				largestSize = size;
				largestUrl = url as string;
			}
		}
	}

	return largestUrl;
};

const getBasePlaylist = async (params: AudioGetPlaylistByIdParams): Promise<AudioPlaylist | null> => {
	try {
		const { playlist } = await window.vkApi.api<{ playlist: AudioPlaylist }>('audio.getPlaylistById', {
			playlist_id: params.playlist_id,
			owner_id: params.owner_id,
			access_key: params.access_key,
			extra_fields: 'owner, duration',
		});

		if (playlist.photo) {
			playlist.coverUrl_l = getLargePhotoUrl(playlist.photo);
		}

		return playlist;
	} catch (e) {
		console.error(e);
	}

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

		if (window.vk.id === 0) return null;

		const audios = await vkApi.api<AudioGetResponse>('audio.get', {
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

const getPlaylistById = async (params: AudioGetPlaylistByIdParams): Promise<AudioPlaylist | null> => {
	const playlist: AudioPlaylist | null = await getBasePlaylist(params);

	if (!playlist) return null;

	try {
		const entity_id: (string | number)[] = [playlist.owner_id, playlist.id];

		if (playlist.access_key) {
			entity_id.push(playlist.access_key);
		}

		const { audios: audioIds } = await vkApi.api<AudioGetAudioIdsBySourceResponse>('audio.getAudioIdsBySource', {
			source: 'playlist',
			entity_id: entity_id.join('_'),
		});

		const items = await vkApi.api<AudioGetByIdResponse>('audio.getById', {
			audios: audioIds.map((e) => e.audio_id).join(','),
		});

		playlist.audios = items;
	} catch (e) {
		console.error(e);
	}

	return playlist;
};

export default getPlaylistById;
