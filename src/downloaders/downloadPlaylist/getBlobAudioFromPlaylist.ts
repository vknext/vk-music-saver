import { getAudioBlob } from 'src/musicUtils/getAudioBlob';
import { AudioAudio, AudioPlaylist } from 'src/schemas/objects';

interface getBlobAudioFromPlaylistParams {
	audio: AudioAudio;
	signal: AbortSignal;
	playlist?: AudioPlaylist;
	forceHls: boolean;
}

const getBlobAudioFromPlaylist = async ({
	audio,
	signal,
	playlist,
	forceHls,
}: getBlobAudioFromPlaylistParams): Promise<Blob | null> => {
	if (signal.aborted) return null;

	if (signal.aborted) return null;
	if (!audio.url) return null;

	try {
		const blob = await getAudioBlob({ audio, playlist, signal, forceHls });

		return blob;
	} catch (e) {
		console.error('error download audio', e);
	}

	return null;
};

export default getBlobAudioFromPlaylist;
