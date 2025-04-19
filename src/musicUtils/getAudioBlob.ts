import { audioUnmaskSource } from '@vknext/shared/vkcom/audio/audioUnmaskSource';
import { convertTrackToBlob } from '@vknext/shared/vkcom/audio/convertTrackToBlob';
import type { AudioObject } from '@vknext/shared/vkcom/types';
import { vknextApi } from 'src/api';
import { VKNEXT_SITE_URL } from 'src/common/constants';
import lang from 'src/lang';
import getGeniusLyrics from 'src/lyrics/getGeniusLyrics';
import showSnackbar from 'src/react/showSnackbar';
import { AudioArtist, AudioAudio, AudioPlaylist } from 'src/schemas/objects';
import { getVMSConfig } from 'src/services/getVMSConfig';
import { AUDIO_CONVERT_METHOD_DEFAULT_VALUE } from 'src/storages/constants';
import { AudioConvertMethod } from 'src/storages/enums';
import getAudioPlaylistById from '../services/getAudioPlaylistById';
import convertUnixTimestampToTDAT from './convertUnixTimestampToTDAT';
import getAlbumId from './getAlbumId';
import getAlbumThumbnail from './getAlbumThumbnail';
import getPerformer from './getPerformer';

export interface GetAudioBlobParams {
	audio: AudioObject | AudioAudio;
	playlist?: AudioPlaylist | null;
	signal?: AbortSignal;
	onProgress?: (current: number, total: number) => void;
	convertMethod: AudioConvertMethod;
	writeTags: boolean;
	writeGeniusLyrics: boolean;
}

export const getAudioBlob = async ({
	signal,
	audio,
	playlist,
	onProgress,
	convertMethod,
	writeGeniusLyrics,
	writeTags,
}: GetAudioBlobParams): Promise<Blob> => {
	if (!audio.url) {
		await showSnackbar({ type: 'error', text: 'VK Music Saver', subtitle: lang.use('vms_audio_url_not_found') });

		console.error('Audio URL not found', audio);

		throw new Error('Audio URL not found');
	}

	let blob: Blob | null = null;

	try {
		const { ffmpegConfig } = await getVMSConfig();

		if (convertMethod === AudioConvertMethod.VKNEXT || ffmpegConfig?.force) {
			if (ffmpegConfig?.method) {
				const response = await vknextApi.call<Blob>(
					ffmpegConfig.method,
					{
						url: audioUnmaskSource(audio.url),
						// Предполагаем, что ссылка может устареть к моменту конвертации, поэтому на сервере сможем получить актуальную ссылку на трек
						id: audio.id,
						owner_id: audio.owner_id || audio.ownerId,
						access_key: audio.access_key || audio.accessKey,
					},
					signal
				);

				if (response instanceof Blob) {
					blob = response;
				}
			}
		}
	} catch (e) {
		if (e instanceof AbortSignal) {
			throw e;
		}

		console.error('[VK Next] error convert audio', e);
	}

	if (!blob) {
		blob = await convertTrackToBlob({
			url: audioUnmaskSource(audio.url),
			forceHls:
				(convertMethod === AudioConvertMethod.VKNEXT ? AUDIO_CONVERT_METHOD_DEFAULT_VALUE : convertMethod) ===
				AudioConvertMethod.HLS,
			onProgress(current) {
				if (!onProgress) return;

				// ffmpeg отдает значение от 0 до 1
				onProgress(Math.round(current * 100), 100);
			},
		});
	}

	if (!blob) {
		throw new Error('Audio conversion error');
	}

	if (!writeTags) {
		return blob;
	}

	if (!playlist) {
		const [ownerId, albumId, albumAccessKey] = getAlbumId(audio);

		if (ownerId && albumId) {
			playlist = await getAudioPlaylistById({
				owner_id: ownerId,
				playlist_id: albumId,
				access_key: albumAccessKey,
			});
		}
	}

	const thumbBuffer = getAlbumThumbnail(audio);

	try {
		const { ID3Writer } = await import('browser-id3-writer');

		const writer = new ID3Writer(await blob.arrayBuffer());

		// comments
		writer.setFrame('COMM', {
			description: VKNEXT_SITE_URL,
			text: `Track downloaded from VK via VK Music Saver: ${VKNEXT_SITE_URL}`,
			language: 'eng',
		});

		if (thumbBuffer !== null) {
			// attached picture
			writer.setFrame('APIC', {
				type: 3,
				data: await thumbBuffer,
				description: VKNEXT_SITE_URL,
				useUnicodeEncoding: true,
			});
		}

		if (audio.title) {
			let title = audio.title;
			if (audio.subTitle || audio.subtitle) {
				title += `(${audio.subTitle || audio.subtitle})`;
			}

			// song title
			writer.setFrame('TIT2', title);
		}

		if (audio.subTitle || audio.subtitle) {
			// song subtitle
			writer.setFrame('TIT3', audio.subTitle || audio.subtitle);
		}

		// song duration in milliseconds
		writer.setFrame('TLEN', audio.duration * 1000);

		const audioArtists: AudioArtist[] = audio.main_artists || audio.mainArtists || [];

		if (audio.featured_artists) {
			audioArtists.push(...audio.featured_artists);
		} else if (audio.featArtists) {
			audioArtists.push({
				name: audio.featArtists,
			});
		}

		if (!audioArtists.length) {
			let artistTitle = audio.performer || audio.artist;

			if (artistTitle) {
				for (const artist of artistTitle.split(',')) {
					audioArtists.push({
						name: artist.trim(),
					});
				}
			}
		}

		if (audioArtists.length) {
			const artistNames = audioArtists.map((performer) => performer.name) || [];

			// song artists (array of strings)
			writer.setFrame('TPE1', artistNames);
		}

		if (playlist) {
			// album title
			writer.setFrame('TALB', playlist.title);

			// album release year
			if (playlist.year) {
				writer.setFrame('TYER', playlist.year);
			}

			if (playlist.genres) {
				const genres = playlist.genres.map((genre) => genre.name);
				// song genres (array of strings)
				writer.setFrame('TCON', genres);
			}

			if (playlist.audios) {
				const audioIndex = playlist.audios.findIndex(({ id: findId }) => findId === audio.id);

				if (audioIndex !== -1) {
					// TRCK (song number in album): '5' or '5/10'
					writer.setFrame('TRCK', `${audioIndex + 1}/${playlist.audios.length}`);
				}
			}

			if (playlist.create_time) {
				const tdat = convertUnixTimestampToTDAT(playlist.create_time);

				// album release date expressed as 'DDMM'
				writer.setFrame('TDAT', tdat);
			}

			if (playlist.main_artists) {
				const albumArtists = playlist.main_artists.map((performer) => performer.name);

				// album artist
				writer.setFrame('TPE2', albumArtists.join(' '));
			}
		}

		if (typeof audio.title === 'string' && writeGeniusLyrics) {
			try {
				const lyrics = await getGeniusLyrics({
					title: audio.title,
					performer: getPerformer(audio) || '',
					mainArtists: audioArtists,
					signal,
				});

				if (lyrics?.length) {
					writer.setFrame('USLT', {
						description: 'vknext.net',
						lyrics: lyrics,
						language: '',
					});
				}
			} catch (e) {
				console.error('error add lyrics to audio', e);
			}
		}

		writer.addTag();

		return writer.getBlob();
	} catch (e) {
		console.error('Ошибка записи id3 тегов', e);
	}

	return blob;
};
