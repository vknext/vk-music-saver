import type { NotifierEvent } from 'src/global';
import lang from 'src/lang';
import arrayUnFlat from 'src/lib/arrayUnFlat';
import saveFileAs from 'src/lib/saveFileAs';
import unescapeHTML from 'src/lib/unescapeHTML';
import getPlaylistById from 'src/musicUtils/getPlaylistById';
import type { ClientZipFile } from 'src/types';
import getBlobAudioFromPlaylist from './getBlobAudioFromPlaylist';

const downloadPlaylist = async (playlistFullId: string) => {
	const event: NotifierEvent = {
		title: 'VK Music Saver',
		text: lang.use('vms_downloading'),
	};

	try {
		window.Notifier.showEvent(event);
	} catch (e) {
		console.error(e);
	}
	// отменяем скрытие элемента
	clearTimeout(event.closeTO);
	clearTimeout(event.fadeTO);
	delete event.startFading;

	const setText = (text: string) => {
		if (!event.baloonEl) return;
		if (!event.baloonEl.closest('body')) return;

		const msg = event.baloonEl.getElementsByClassName('notifier_baloon_msg')[0] as HTMLElement;
		if (!msg) return;

		msg.innerText = text;
	};

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

	const filename = unescapeHTML(`${nameChunks.join('')}.zip`);

	const promises: Promise<ClientZipFile | null>[] = [];

	let audioIndex = 1;

	let progress = 0;
	const totalAudios = playlist.audios.length;

	setText(`${filename} (${progress}/${totalAudios})`);

	const updateProgress = () => {
		progress++;

		setText(`${filename} (${progress}/${totalAudios})`);
	};

	for (const audios of arrayUnFlat(playlist.audios, 8)) {
		if (signal.aborted) return;

		for (const audio of audios) {
			const promiseBlob = getBlobAudioFromPlaylist({
				audio,
				lastModified,
				signal,
				audioIndex: audioIndex++,
				playlist,
			});

			promiseBlob.then(() => {
				updateProgress();
			});

			promises.push(promiseBlob);
		}

		await Promise.all(promises);
	}

	const results = await Promise.all(promises);

	const files = results.filter((f) => !!f);

	if (signal.aborted) return;

	setText(`${filename} - ${lang.use('vms_archivation')}`);

	const { downloadZip } = await import('client-zip');

	const blob = await downloadZip(files).blob();

	const blobUrl = URL.createObjectURL(blob);

	try {
		window.Notifier.hideEvent(event);
	} catch (e) {
		console.error(e);
	}

	await saveFileAs(blobUrl, filename);

	URL.revokeObjectURL(blobUrl);
};

export default downloadPlaylist;
