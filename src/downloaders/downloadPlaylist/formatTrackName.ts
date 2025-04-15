import fixFilename from 'src/lib/fixFilename';
import getPerformer from 'src/musicUtils/getPerformer';
import type { AudioAudio } from 'src/schemas/objects';

interface formatTrackFilenameProps {
	isNumTracksInPlaylist?: boolean;
	audio: AudioAudio;
	index?: number;
}

const formatTrackName = ({ isNumTracksInPlaylist, audio, index }: formatTrackFilenameProps) => {
	const names: string[] = [];

	if (isNumTracksInPlaylist && index) {
		names.push(`${index}. `);
	}

	const artistTitle = getPerformer(audio);

	names.push(`${artistTitle.trim()} - ${audio.title}`);

	if (audio.subtitle) {
		names.push(` (${audio.subtitle})`);
	}

	return fixFilename(names.join(''));
};

export default formatTrackName;
