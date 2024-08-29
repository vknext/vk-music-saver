import lang from 'src/lang';
import saveFileAs from 'src/lib/saveFileAs';
import unescapeHTML from 'src/lib/unescapeHTML';
import { getAlbumThumbUrl } from 'src/musicUtils/getAlbumThumbnail';
import getPlaylistById from 'src/musicUtils/getPlaylistById';

const downloadPlaylistCover = async (playlistFullId: string) => {
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

	const albumThumbUrl = getAlbumThumbUrl(playlist);

	if (!albumThumbUrl) {
		window.Notifier.showEvent({ title: 'VK Music Saver', text: lang.use('vms_album_cover_not_found') });
		return;
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
};

export default downloadPlaylistCover;
