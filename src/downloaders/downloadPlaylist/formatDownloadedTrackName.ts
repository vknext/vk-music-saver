import type { AudioObject } from '@vknext/shared/vkcom/types';
import { DEFAULT_TRACK_TEMPLATE, TrackTemplateVariable } from 'src/common/constants';
import { formatTrackName } from 'src/musicUtils/formatTrackName';
import getAudioBitrate from 'src/musicUtils/getAudioBitrate';
import getPerformer from 'src/musicUtils/getPerformer';
import type { AudioAudio } from 'src/schemas/objects';
import GlobalStorage from 'src/storages/GlobalStorage';

interface formatTrackFilenameProps {
	isPlaylist: boolean;
	audio: AudioAudio | AudioObject;
	index?: string | number;
}

const formatDownloadedTrackName = async ({ isPlaylist, audio, index }: formatTrackFilenameProps) => {
	const template = await GlobalStorage.getValue(
		isPlaylist ? 'playlist_track_template' : 'single_track_template',
		DEFAULT_TRACK_TEMPLATE
	);

	const artistTitle = getPerformer(audio);

	let bitrate: number | undefined = undefined;

	if (template.includes(TrackTemplateVariable.BITRATE)) {
		try {
			const audioData = await getAudioBitrate(audio);

			if (audioData?.bitrate) {
				bitrate = audioData.bitrate;
			}
		} catch (e) {
			console.error(e);
		}
	}

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
