import type { AudioObject } from '@vknext/shared/vkcom/types';
import { DEFAULT_TRACK_TEMPLATE } from 'src/common/constants';
import { formatTrackName } from 'src/musicUtils/formatTrackName';
import getPerformer from 'src/musicUtils/getPerformer';
import type { AudioAudio } from 'src/schemas/objects';
import GlobalStorage from 'src/storages/GlobalStorage';

interface formatTrackFilenameProps {
	isPlaylist: boolean;
	audio: AudioAudio | AudioObject;
	index?: string | number;
	bitrate?: number;
}

const formatDownloadedTrackName = async ({ isPlaylist, audio, index, bitrate }: formatTrackFilenameProps) => {
	const template = await GlobalStorage.getValue(
		isPlaylist ? 'playlist_track_template' : 'single_track_template',
		DEFAULT_TRACK_TEMPLATE
	);

	const artistTitle = getPerformer(audio);

	return formatTrackName({
		template,
		artist: artistTitle,
		title: audio.title,
		subtitle: audio.subtitle,
		bitrate,
		index,
	});
};

export default formatDownloadedTrackName;
