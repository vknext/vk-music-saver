import { vknextApi } from 'src/api';
import lang from 'src/lang';
import saveFileAs from 'src/lib/saveFileAs';
import unescapeHTML from 'src/lib/unescapeHTML';
import { getAlbumThumbUrl } from 'src/musicUtils/getAlbumThumbnail';
import showSnackbar from 'src/react/showSnackbar';
import getAudioPlaylistById from 'src/services/getAudioPlaylistById';

const downloadPlaylistCover = async (playlistFullId: string) => {
	const [ownerId, playlistId, playlistAccessKey] = playlistFullId.split('_');

	const playlist = await getAudioPlaylistById({
		owner_id: parseInt(ownerId),
		playlist_id: parseInt(playlistId),
		access_key: playlistAccessKey,
		withTracks: false,
	});

	if (!playlist) {
		return await showSnackbar({
			type: 'error',
			text: 'VK Music Saver',
			subtitle: lang.use('vms_playlist_not_found'),
		});
	}

	const albumThumbUrl = getAlbumThumbUrl(playlist);

	if (!albumThumbUrl) {
		return await showSnackbar({
			type: 'error',
			text: 'VK Music Saver',
			subtitle: lang.use('vms_album_cover_not_found'),
		});
	}

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

	saveFileAs(albumThumbUrl, unescapeHTML(nameChunks.join('')) + '.jpg');

	await vknextApi.call('vms.stat', { type: 'apc', data: 1 });
};

export default downloadPlaylistCover;
