import GlobalStorage from 'src/storages/GlobalStorage';

export const incrementDownloadedTracksCount = async (): Promise<void> => {
	const current = await GlobalStorage.getValue('downloaded_tracks_count', 0);

	await GlobalStorage.setValue('downloaded_tracks_count', current + 1);
};

export const incrementDownloadedPlaylistsCount = async (): Promise<void> => {
	const current = await GlobalStorage.getValue('downloaded_playlists_count', 0);

	await GlobalStorage.setValue('downloaded_playlists_count', current + 1);
};
