import { createPromise } from '@vknext/shared/utils/createPromise';
import GlobalStorage from 'src/storages/GlobalStorage';

const waitForDownloadMilestone = async (trackThreshold: number, playlistThreshold: number): Promise<boolean> => {
	const { promise, resolve } = createPromise<boolean>();

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

	return promise;
};

export default waitForDownloadMilestone;
