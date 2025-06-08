import { TrackTemplateVariable } from 'src/common/constants';
import fixFilename from 'src/lib/fixFilename';

export interface formatTrackFilenameProps {
	template: string;
	artist?: string;
	title?: string;
	subtitle?: string;
	bitrate?: number;
	index?: number | string;
}

export const formatTrackName = ({
	template,
	artist = '',
	title = '',
	subtitle,
	bitrate,
	index,
}: formatTrackFilenameProps) => {
	let result = template
		.replace(TrackTemplateVariable.ARTIST, artist)
		.replace(TrackTemplateVariable.TITLE, title)
		.replace(TrackTemplateVariable.SUBTITLE, subtitle ? `(${subtitle})` : '')
		.replace(TrackTemplateVariable.BITRATE, bitrate ? `[${bitrate}kbps]` : '');

	if (typeof index === 'number' || typeof index === 'string') {
		result = `${index}. ${result}`;
	}

	return fixFilename(result.replaceAll('  ', ' ').trim());
};
