import { AudioObject } from 'src/global';
import lang from 'src/lang';
import saveFileAs from 'src/lib/saveFileAs';
import { getAudioBlob, type GetAudioBlobParams } from 'src/musicUtils/getAudioBlob';
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

interface DownloadAudioParams extends Pick<GetAudioBlobParams, 'onProgress'> {
	audioObject: AudioObject | AudioAudio;
}

const downloadAudio = async ({ audioObject, onProgress }: DownloadAudioParams) => {
	if (!audioObject) {
		window.Notifier.showEvent({ title: 'VK Music Saver', text: lang.use('vms_audio_not_found') });
		return;
	}

	const audio = await getAudioByObject(audioObject);
	if (!audio.url) {
		window.Notifier.showEvent({ title: 'VK Music Saver', text: lang.use('vms_audio_url_not_found') });
		return;
	}

	let artistTitle = getPerformer(audio);

	let audioName = [artistTitle.trim(), audio.title].join(' - ');

	if (audio.subtitle) {
		audioName += ` (${audio.subtitle})`;
	}

	try {
		const blob = await getAudioBlob({ audio, onProgress });

		const blobUrl = URL.createObjectURL(blob);

		await saveFileAs(blobUrl, `${audioName}.mp3`);

		URL.revokeObjectURL(blobUrl);
	} catch (error) {
		console.error('Error downloading audio:', error);
		throw new Error('Failed to download audio');
	}
};

export default downloadAudio;
