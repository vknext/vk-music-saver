import unescapeHTML from 'src/lib/unescapeHTML';
import type { AudioPlaylist } from 'src/schemas/objects';

export const formatPlaylistName = (playlist: AudioPlaylist) => {
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

	return unescapeHTML(nameChunks.join(''));
};
