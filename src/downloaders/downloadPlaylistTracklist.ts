import lang from 'src/lang';
import { abortStreamOnUnload } from 'src/lib/abortStreamOnUnload';
import { streamSaver } from 'src/lib/streamSaver';
import showSnackbar from 'src/react/showSnackbar';
import { PlaylistSource } from 'src/sources/PlaylistSource';
import GlobalStorage from 'src/storages/GlobalStorage';
import formatDownloadedTrackName from './downloadPlaylist/formatDownloadedTrackName';
import { formatPlaylistName } from './downloadPlaylist/formatPlaylistName';

export const downloadPlaylistTracklist = async (playlistFullId: string) => {
	showSnackbar({ text: 'VK Music Saver', subtitle: lang.use('vms_preparing_tracklist') }).catch(console.error);

	const playlist = PlaylistSource.fromRawId(playlistFullId);

	const [playlistMeta, playlistIsReverse] = await Promise.all([
		playlist.getMeta(),
		GlobalStorage.getValue('download_playlist_in_reverse', false),
	]);

	if (!playlistMeta) {
		return await showSnackbar({
			type: 'error',
			text: 'VK Music Saver',
			subtitle: lang.use('vms_playlist_not_found'),
		});
	}

	const playlistFolderName = formatPlaylistName(playlistMeta);

	const fileStream = streamSaver.createWriteStream(`${playlistFolderName}.txt`);
	const cleanup = abortStreamOnUnload(fileStream);

	const [playlistStream, isNumTracks] = await Promise.all([
		playlist.getStream({ reverse: playlistIsReverse }),
		GlobalStorage.getValue('num_tracks_in_playlist', true),
	]);

	if (playlistStream.total === 0) {
		fileStream.abort();
		cleanup();

		return await showSnackbar({
			type: 'error',
			text: 'VK Music Saver',
			subtitle: lang.use('vms_playlist_is_empty'),
		});
	}

	const writer = fileStream.getWriter();
	const encoder = new TextEncoder();

	let index = 1;

	try {
		for await (const audio of playlistStream.items) {
			try {
				const isLastLine = index === playlistStream.total;

				const trackName = await formatDownloadedTrackName({
					isPlaylist: true,
					audio,
					index: isNumTracks ? index : undefined,
					totalAudios: playlistStream.total,
				});

				const line = trackName + (isLastLine ? '' : '\n');

				await writer.write(encoder.encode(line));
			} catch (e) {
				console.error('VK Music Saver/downloadPlaylistTracklist', e);
			}

			index++;
		}

		await writer.close();
	} catch (e) {
		console.error('VK Music Saver/downloadPlaylistTracklist', e);
	} finally {
		cleanup();
	}
};
