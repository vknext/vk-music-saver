import lang from 'src/lang';
import arrayUnFlat from 'src/lib/arrayUnFlat';
import saveFileAs from 'src/lib/saveFileAs';
import unescapeHTML from 'src/lib/unescapeHTML';
import getPlaylistById from 'src/musicUtils/getPlaylistById';
import { ClientZipFile } from 'src/types';
import getBlobAudioFromPlaylist from './getBlobAudioFromPlaylist';

const downloadPlaylist = async (playlistFullId: string) => {
	window.Notifier.showEvent({ title: 'VK Music Saver', text: lang.use('vms_downloading') });

	const [ownerId, playlistId, playlistAccessKey] = playlistFullId.split('_');

	const playlist = await getPlaylistById({
		owner_id: parseInt(ownerId),
		playlist_id: parseInt(playlistId),
		access_key: playlistAccessKey,
	});

	if (!playlist) {
		window.Notifier.showEvent({ title: 'VK Music Saver', text: lang.use('vms_playlist_not_found') });
		return;
	}

	if (playlist?.error?.error_msg) {
		window.Notifier.showEvent({ title: 'VK Music Saver', text: playlist.error.error_msg });
		return;
	}

	if (!playlist.audios?.length) {
		window.Notifier.showEvent({ title: 'VK Music Saver', text: lang.use('vms_playlist_is_empty') });
		return;
	}

	const controller = new AbortController();
	const { signal } = controller;
	const lastModified = new Date();

	const albumArtists = (playlist.main_artists || []).map((performer) => performer.name);

	const nameChunks = [];

	if (albumArtists.length) {
		nameChunks.push(`${albumArtists.join(', ')} - `);
	}

	if (playlist.title) {
		nameChunks.push(playlist.title);
	} else {
		nameChunks.push('playlist');
	}

	const promises: Promise<ClientZipFile | null>[] = [];

	let audioIndex = 1;

	for (const audios of arrayUnFlat(playlist.audios, 10)) {
		if (signal.aborted) return;

		for (const audio of audios) {
			promises.push(
				getBlobAudioFromPlaylist({
					audio,
					lastModified,
					signal,
					audioIndex: audioIndex++,
					playlist,
				})
			);
		}

		await Promise.all(promises);
	}

	const results = await Promise.all(promises);

	const files = results.filter((f) => !!f);

	if (signal.aborted) return;

	const { downloadZip } = await import('client-zip');

	const blob = await downloadZip(files).blob();

	const blobUrl = URL.createObjectURL(blob);

	await saveFileAs(blobUrl, unescapeHTML(`${nameChunks.join('')}.zip`));

	URL.revokeObjectURL(blobUrl);
};

export default downloadPlaylist;
