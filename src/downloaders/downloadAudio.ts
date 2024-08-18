import { convertTrackToBlob } from '@vknext/audio-utils';
import { AudioObject } from 'src/global';
import saveFileAs from 'src/lib/saveFileAs';
import getAudioByObject from 'src/musicUtils/getAudioByObject';
import { AudioArtist, AudioAudio } from 'src/schemas/objects';

const getArtistTitle = (artists: AudioArtist[] = []) => artists.map((artist) => artist.name).join(', ');

const getPerformer = (audio: AudioObject | AudioAudio) => {
	let artistTitle = audio.performer || audio.artist;

	if (!artistTitle) {
		const mainArtists = getArtistTitle(audio.main_artists || audio.mainArtists);
		const featuredArtists = getArtistTitle(audio.featured_artists || audio.featArtists);

		artistTitle = mainArtists;

		if (featuredArtists) {
			artistTitle += ` feat. ${featuredArtists}`;
		}
	}

	return artistTitle;
};

const downloadAudio = async (audioObject: AudioObject) => {
	if (!audioObject) {
		window.Notifier.showEvent({ text: 'Audio not found' });
		return;
	}

	const audio = await getAudioByObject(audioObject);
	if (!audio.url) {
		window.Notifier.showEvent({ text: 'Audio URL not found' });
		return;
	}

	let artistTitle = getPerformer(audio);

	let audioName = [artistTitle.trim(), audio.title].join(' - ');

	if (audio.subtitle) {
		audioName += ` (${audio.subtitle})`;
	}

	try {
		const blob = await convertTrackToBlob({
			url: audio.url,
		});

		const blobUrl = URL.createObjectURL(blob);

		await saveFileAs(blobUrl, `${audioName}.mp3`);

		URL.revokeObjectURL(blobUrl);
	} catch (error) {
		console.error('Error downloading audio:', error);
		throw new Error('Failed to download audio');
	}
};

export default downloadAudio;
