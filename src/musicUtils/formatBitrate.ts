export const formatBitrate = (bitrate?: number): string => {
	if (!bitrate) return '';

	if (bitrate <= 200) {
		return `~${bitrate}`;
	}

	return `${bitrate}`;
};
