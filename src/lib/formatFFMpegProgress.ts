const formatFFMpegProgress = (progress: number): string => {
	return `${Math.round(progress * 100)}%`;
};

export default formatFFMpegProgress;
