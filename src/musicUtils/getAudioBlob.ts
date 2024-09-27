import { audioUnmaskSource, convertTrackToBlob, type ConvertTrackToBlobOptions } from '@vknext/audio-utils';
import { AudioObject } from 'src/global';
import lang from 'src/lang';
import convertBlobToUint8Array from 'src/lib/convertBlobToUint8Array';
import getGeniusLyrics from 'src/lyrics/getGeniusLyrics';
import { AudioArtist, AudioAudio, AudioPlaylist } from 'src/schemas/objects';
import convertUnixTimestampToTDAT from './convertUnixTimestampToTDAT';
import getAlbumId from './getAlbumId';
import getAlbumThumbnail from './getAlbumThumbnail';
import getPlaylistById from './getPlaylistById';

export interface GetAudioBlobParams extends Pick<ConvertTrackToBlobOptions, 'onProgress'> {
	audio: AudioObject | AudioAudio;
	playlist?: AudioPlaylist | null;
	signal?: AbortSignal;
}

export const getAudioBlob = async ({ audio, playlist, onProgress }: GetAudioBlobParams) => {
	if (!audio.url) {
		window.Notifier.showEvent({ title: 'VK Music Saver', text: lang.use('vms_audio_url_not_found') });

		console.error('Audio URL not found', audio);

		throw new Error('Audio URL not found');
	}

	const blob = await convertTrackToBlob({
		url: audioUnmaskSource(audio.url),
		onProgress,
	});

	if (!playlist) {
		const [ownerId, albumId, albumAccessKey] = getAlbumId(audio);

		if (ownerId && albumId) {
			playlist = await getPlaylistById({
				owner_id: ownerId,
				playlist_id: albumId,
				access_key: albumAccessKey,
			});
		}
	}

	const thumbBuffer = getAlbumThumbnail(audio);

	const { ID3Writer } = await import('browser-id3-writer');

	const writer = new ID3Writer(await convertBlobToUint8Array(blob));

	// comments
	writer.setFrame('COMM', {
		description: 'vknext.net',
		text: 'Track downloaded from VK via VK Music Saver: https://vknext.net',
		language: 'eng',
	});

	if (thumbBuffer !== null) {
		// attached picture
		writer.setFrame('APIC', {
			type: 3,
			data: await thumbBuffer,
			description: 'vknext.net',
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

	if (audioArtists.length) {
		const artistNames = audioArtists.map((performer) => performer.name) || [];

		// song artists (array of strings)
		writer.setFrame('TPE1', artistNames);
	}

	if (playlist) {
		// album title
		writer.setFrame('TALB', playlist.title);
		// album release year
		writer.setFrame('TYER', playlist.year);

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
			writer.setFrame('TPE2', albumArtists);
		}

		if (typeof audio.title === 'string') {
			try {
				const lyrics = await getGeniusLyrics({
					title: audio.title,
					performer: audio.performer || '',
					mainArtists: audioArtists,
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
	}

	writer.addTag();

	return writer.getBlob();
};
