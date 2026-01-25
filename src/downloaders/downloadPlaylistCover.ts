import { vknextApi } from 'src/api';
import lang from 'src/lang';
import saveFileAs from 'src/lib/saveFileAs';
import unescapeHTML from 'src/lib/unescapeHTML';
import { getAlbumThumbUrl } from 'src/musicUtils/getAlbumThumbnail';
import showSnackbar from 'src/react/showSnackbar';
import { PlaylistSource } from 'src/sources/PlaylistSource';

const downloadPlaylistCover = async (playlistFullId: string) => {
	const playlist = PlaylistSource.fromRawId(playlistFullId);

	const playlistMeta = await playlist.getMeta();

	if (!playlistMeta) {
		return await showSnackbar({
			type: 'error',
			text: 'VK Music Saver',
			subtitle: lang.use('vms_playlist_not_found'),
		});
	}

	const albumThumbUrl = getAlbumThumbUrl(playlistMeta);

	if (!albumThumbUrl) {
		return await showSnackbar({
			type: 'error',
			text: 'VK Music Saver',
			subtitle: lang.use('vms_album_cover_not_found'),
		});
	}

	const albumArtists = (playlistMeta.main_artists || []).map((performer) => performer.name);

	const nameChunks = [];

	if (albumArtists.length) {
		nameChunks.push(`${albumArtists.join(', ')} - `);
	}

	if (playlistMeta.title) {
		nameChunks.push(playlistMeta.title);
	} else {
		nameChunks.push('playlist');
	}

	saveFileAs(albumThumbUrl, unescapeHTML(nameChunks.join('')) + '.jpg');

	await vknextApi.call('vms.stat', { type: 'apc', data: 1 });
};

export default downloadPlaylistCover;
