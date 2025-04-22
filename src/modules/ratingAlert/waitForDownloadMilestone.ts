import GlobalStorage from 'src/storages/GlobalStorage';

const waitForDownloadMilestone = async (trackThreshold: number, playlistThreshold: number): Promise<boolean> => {
	const downloaded_tracks_count = await GlobalStorage.getValue('downloaded_tracks_count', 0);
	const downloaded_playlists_count = await GlobalStorage.getValue('downloaded_playlists_count', 0);

	if (downloaded_tracks_count >= trackThreshold || downloaded_playlists_count >= playlistThreshold) {
		return true;
	}

	return new Promise<boolean>((resolve) => {
		const offTrack = GlobalStorage.addListener('downloaded_tracks_count', ({ newValue }) => {
			if (newValue >= trackThreshold) {
				cleanup();
				resolve(true);
			}
		});

		const offPlaylist = GlobalStorage.addListener('downloaded_playlists_count', ({ newValue }) => {
			if (newValue >= playlistThreshold) {
				cleanup();
				resolve(true);
			}
		});

		const cleanup = () => {
			offTrack();
			offPlaylist();
		};
	});
};

export default waitForDownloadMilestone;
