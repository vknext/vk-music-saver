import { getAudioBlob, type GetAudioBlobParams } from 'src/musicUtils/getAudioBlob';

type getBlobAudioFromPlaylistParams = Omit<GetAudioBlobParams, 'onProgress'>;

const getBlobAudioFromPlaylist = async (props: getBlobAudioFromPlaylistParams): Promise<Blob | null> => {
	if (props.signal?.aborted) return null;
	if (!props.audio?.url) return null;

	try {
		const blob = await getAudioBlob(props);

		return blob;
	} catch (e) {
		console.error('error download audio', e);
	}

	return null;
};

export default getBlobAudioFromPlaylist;
