import type { AudioObject } from '@vknext/shared/vkcom/types';
import { AudioAudio } from 'src/schemas/objects';

export type AlbumId = [owner_id: number, id: number];
export type AlbumIdAccessKey = [owner_id: number, id: number, access_key: string];

const getAlbumId = (audio: AudioObject | AudioAudio): AlbumId | AlbumIdAccessKey | [] => {
	if (audio.album && !Array.isArray(audio.album)) {
		const album: AudioAudio['album'] = audio.album!;

		if (album?.access_key) {
			return [album.owner_id, album.id, album.access_key];
		}

		return [album.owner_id, album.id];
	}

	if (!audio.album) {
		return [];
	}

	return audio.album;
};

export default getAlbumId;
