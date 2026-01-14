import type { AudioObject } from '@vknext/shared/vkcom/types';
import { ID3Writer } from 'browser-id3-writer';
import vkDomain from 'src/common/vkDomain';
import getGeniusLyrics from 'src/lyrics/getGeniusLyrics';
import type { AudioArtist, AudioAudio, AudioPlaylist } from 'src/schemas/objects';
import convertUnixTimestampToTDAT from './convertUnixTimestampToTDAT';
import getAlbumThumbnail from './getAlbumThumbnail';
import getPerformer from './getPerformer';

interface CreateId3TagBufferParams {
	audio: AudioAudio | AudioObject;
	playlist?: AudioPlaylist | null;
	enableLyrics?: boolean;
	signal?: AbortSignal;
}

const customGenresMap: Record<number, string> = {
	1: 'Rock',
	2: 'Pop',
	3: 'Rap & Hip-Hop',
	4: 'Easy Listening',
	5: 'Dance & House',
	6: 'Instrumental',
	7: 'Metal',
	21: 'Alternative',
	8: 'Dubstep',
	1001: 'Jazz & Blues',
	10: 'Drum & Bass',
	11: 'Trance',
	12: 'Chanson',
	13: 'Ethnic',
	14: 'Acoustic & Vocal',
	15: 'Reggae',
	16: 'Classical',
	17: 'Indie Pop',
	18: 'Other',
	19: 'Speech',
	22: 'Electropop & Disco',
};

/**
 * Взято из VK Next 14.8.0
 * @see https://github.com/vknext/vknext
 */
export const createId3TagBuffer = async ({
	audio,
	playlist,
	enableLyrics,
	signal,
}: CreateId3TagBufferParams): Promise<Uint8Array> => {
	const writer = new ID3Writer(new ArrayBuffer(0));

	writer.setFrame('COMM', {
		description: 'vknext.net',
		text: 'Трек скачан из ВКонтакте через VK Music Saver: https://vknext.net',
		language: 'rus',
	});

	const thumbBuffer = await getAlbumThumbnail(audio, signal);

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

	if (!audioArtists.length) {
		const artistTitle = audio.performer || audio.artist;

		if (artistTitle) {
			for (const artist of artistTitle.split(',')) {
				audioArtists.push({
					name: artist.trim(),
				});
			}
		}
	}

	// song artists (array of strings)
	let tpe1: string[] | null = null;

	if (audioArtists.length) {
		const artistNames = audioArtists.map((performer) => performer.name) || [];

		tpe1 = artistNames;

		const firstArtist = audioArtists.find((artist) => !!artist.id || !!artist.domain);

		if (firstArtist) {
			// official artist/performer webpage
			writer.setFrame('WOAR', `https://${vkDomain}/artist/${firstArtist.domain || firstArtist.id}`);
		}
	} else if (audio.artist) {
		tpe1 = audio.artist.split(',').map((e: string) => e.trim());
	} else if (audio.performer) {
		tpe1 = audio.performer.split(',').map((e: string) => e.trim());
	}

	if (tpe1) {
		writer.setFrame('TPE1', tpe1);

		if (!playlist?.main_artists) {
			writer.setFrame('TPE2', tpe1.join(', '));
		}
	}

	if (audio.release_audio_id) {
		// official audio file webpage
		writer.setFrame('WOAF', `https://${vkDomain}/audio${audio.release_audio_id}`);
	}

	if (playlist) {
		// album title
		writer.setFrame('TALB', playlist.title);
		if (playlist.year) {
			// album release year
			writer.setFrame('TYER', playlist.year);
		}

		const albumId: (string | number)[] = [playlist.owner_id, playlist.id];

		if (playlist.access_key) {
			albumId.push(playlist.access_key);
		}

		// official audio source webpage
		writer.setFrame('WOAS', `https://${vkDomain}/music/album/${albumId.join('_')}`);

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
			writer.setFrame('TPE2', albumArtists.join(', '));
		}
	} else {
		const customGenre = customGenresMap[audio.genre_id!];

		if (customGenre) {
			writer.setFrame('TCON', [customGenre]);
		}
	}

	if (typeof audio.title === 'string' && enableLyrics) {
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

	const blob = writer.getBlob();
	const arrayBuffer = await blob.arrayBuffer();

	return new Uint8Array(arrayBuffer);
};
