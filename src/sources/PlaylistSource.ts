import { arrayUnFlat } from '@vknext/shared/utils/arrayUnFlat';
import { OwnedIdentity } from 'src/lib/OwnedIdentity';
import type { AudioAudio, AudioAudioRawIdTracked, AudioPlaylist } from 'src/schemas/objects';
import type { AudioGetAudioIdsBySourceResponse, AudioGetByIdResponse } from 'src/schemas/responses';

interface PlaylistStream {
	total: number;
	items: AsyncGenerator<AudioAudio, void, unknown>;
}

interface PlaylistSourceTracksParams {
	reverse?: boolean;
}

export class PlaylistSource {
	private _identity: OwnedIdentity;
	private _cachedMeta: AudioPlaylist | null = null;

	constructor(identity: OwnedIdentity) {
		this._identity = identity;
	}

	static fromRawId(rawId: string) {
		return new PlaylistSource(OwnedIdentity.fromRawId(rawId));
	}

	async getMeta(): Promise<AudioPlaylist | null> {
		if (this._cachedMeta) return this._cachedMeta;

		try {
			const { playlist } = await window.vkApi.api<{ playlist: AudioPlaylist }>('audio.getPlaylistById', {
				playlist_id: this._identity.id,
				owner_id: this._identity.ownerId,
				access_key: this._identity.accessKey,
				extra_fields: 'owner,duration',
			});

			this._cachedMeta = playlist;

			return playlist;
		} catch (e) {
			console.error('[VK Music Saver/PlaylistSource/getMeta]', e);
		}

		return null;
	}

	async getStream({ reverse = false }: PlaylistSourceTracksParams = {}): Promise<PlaylistStream> {
		const audioIds = await this._getAudioIds();

		if (reverse) {
			audioIds.reverse();
		}

		return {
			total: audioIds.length,
			items: this._yieldTracks(audioIds),
		};
	}

	private async *_yieldTracks(audioIds: AudioAudioRawIdTracked[]): AsyncGenerator<AudioAudio, void, unknown> {
		for (const ids of arrayUnFlat(audioIds, 100)) {
			try {
				const tracks = await window.vkApi.api<AudioGetByIdResponse>('audio.getById', {
					audios: ids.map((e) => e.audio_id).join(','),
				});

				for (const track of tracks) {
					yield track;
				}
			} catch (e) {
				console.error('[VK Music Saver/PlaylistSource/tracks]', e);
			}
		}
	}

	private async _getAudioIds(): Promise<AudioAudioRawIdTracked[]> {
		const { audios: audioIds } = await window.vkApi.api<AudioGetAudioIdsBySourceResponse>(
			'audio.getAudioIdsBySource',
			{
				source: 'playlist',
				entity_id: this._identity.accessRawId,
			}
		);

		return audioIds;
	}
}
