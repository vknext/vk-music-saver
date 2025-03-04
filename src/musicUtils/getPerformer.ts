import type { AudioObject } from 'src/global';
import type { AudioArtist, AudioAudio } from 'src/schemas/objects';

const getArtistTitle = (artists: AudioArtist[] = []) => artists.map((artist) => artist.name).join(', ');

const getPerformer = (audio: AudioObject | AudioAudio) => {
	let artistTitle: string = audio.performer || audio.artist;

	if (!artistTitle) {
		const mainArtists = getArtistTitle(audio.main_artists || audio.mainArtists);
		const featuredArtists = getArtistTitle(audio.featured_artists || audio.featArtists);

		artistTitle = mainArtists;

		if (featuredArtists) {
			artistTitle += ` feat. ${featuredArtists}`;
		}
	}

	return artistTitle;
};

export default getPerformer;
