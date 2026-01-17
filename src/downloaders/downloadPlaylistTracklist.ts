import lang from 'src/lang';
import { streamSaver } from 'src/lib/streamSaver';
import showSnackbar from 'src/react/showSnackbar';
import getAudioPlaylistById from 'src/services/getAudioPlaylistById';
import GlobalStorage from 'src/storages/GlobalStorage';
import formatDownloadedTrackName from './downloadPlaylist/formatDownloadedTrackName';
import { formatPlaylistName } from './downloadPlaylist/formatPlaylistName';

export const downloadPlaylistTracklist = async (playlistFullId: string) => {
	const [ownerId, playlistId, playlistAccessKey] = playlistFullId.split('_');

	await showSnackbar({ text: 'VK Music Saver', subtitle: lang.use('vms_preparing_tracklist') });

	const [playlist, playlistIsReverse, isNumTracks] = await Promise.all([
		getAudioPlaylistById({
			owner_id: parseInt(ownerId),
			playlist_id: parseInt(playlistId),
			access_key: playlistAccessKey,
			withTracks: true,
		}),
		GlobalStorage.getValue('download_playlist_in_reverse', false),
		GlobalStorage.getValue('num_tracks_in_playlist', true),
	]);

	if (!playlist) {
		return await showSnackbar({
			type: 'error',
			text: 'VK Music Saver',
			subtitle: lang.use('vms_playlist_not_found'),
		});
	}

	if (playlist?.error?.error_msg) {
		return await showSnackbar({
			type: 'error',
			text: 'VK Music Saver',
			subtitle: playlist.error.error_msg,
		});
	}

	if (!playlist.audios?.length) {
		return await showSnackbar({
			type: 'error',
			text: 'VK Music Saver',
			subtitle: lang.use('vms_playlist_is_empty'),
		});
	}

	if (playlistIsReverse) {
		playlist.audios.reverse();
	}

	const playlistFolderName = formatPlaylistName(playlist);
	const filename = `${playlistFolderName}.txt`;

	const fileStream = streamSaver.createWriteStream(filename);

	const writer = fileStream.getWriter();
	const encoder = new TextEncoder();

	let index = 1;
	const totalAudios = playlist.audios.length;
	for (const audio of playlist.audios) {
		const isLastLine = index === playlist.audios.length;

		const trackName = await formatDownloadedTrackName({
			isPlaylist: true,
			audio,
			index: isNumTracks ? index : undefined,
			totalAudios,
		});

		const line = trackName + (isLastLine ? '' : '\n');

		await writer.write(encoder.encode(line));

		index++;
	}

	await writer.close();
};
