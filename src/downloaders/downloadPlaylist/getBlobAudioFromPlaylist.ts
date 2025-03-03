import fixFilename from 'src/lib/fixFilename';
import { getAudioBlob } from 'src/musicUtils/getAudioBlob';
import { AudioAudio, AudioPlaylist } from 'src/schemas/objects';

interface getBlobAudioFromPlaylistParams {
	audio: AudioAudio;
	lastModified: Date;
	signal: AbortSignal;
	audioIndex: number;
	playlist?: AudioPlaylist;
	isNumTracksInPlaylist?: boolean;
}

const getBlobAudioFromPlaylist = async ({
	audio,
	lastModified,
	signal,
	playlist,
	audioIndex,
	isNumTracksInPlaylist,
}: getBlobAudioFromPlaylistParams) => {
	if (signal.aborted) return null;
	if (!audio.url) return null;

	try {
		const blob = await getAudioBlob({
			audio,
			playlist,
			signal,
		});

		const names = [];

		if (isNumTracksInPlaylist) {
			names.push(`${audioIndex}. `);
		}

		names.push(`${audio.artist} - ${audio.title}`);

		if (audio.subtitle) {
			names.push(` (${audio.subtitle})`);
		}

		names.push('.mp3');

		return {
			name: fixFilename(names.join('')),
			lastModified: audio.date ? new Date(audio.date * 1000) : lastModified,
			input: blob,
		};
	} catch (e) {
		console.error('error download audio', e);

		return null;
	}
};

export default getBlobAudioFromPlaylist;
