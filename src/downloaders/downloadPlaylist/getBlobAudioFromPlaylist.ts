import { getAudioBlob } from 'src/musicUtils/getAudioBlob';
import { AudioAudio, AudioPlaylist } from 'src/schemas/objects';
import type { AudioConvertMethod } from 'src/storages/enums';

interface getBlobAudioFromPlaylistParams {
	audio: AudioAudio;
	signal: AbortSignal;
	playlist?: AudioPlaylist;
	convertMethod: AudioConvertMethod;
}

const getBlobAudioFromPlaylist = async ({
	audio,
	signal,
	playlist,
	convertMethod,
}: getBlobAudioFromPlaylistParams): Promise<Blob | null> => {
	if (signal.aborted) return null;
	if (!audio.url) return null;

	try {
		const blob = await getAudioBlob({ audio, playlist, signal, convertMethod });

		return blob;
	} catch (e) {
		console.error('error download audio', e);
	}

	return null;
};

export default getBlobAudioFromPlaylist;
