import type { AudioObject } from 'global';

const cache = new Map<string, string>();

const normalizeString = (str: string): string => str.trim().toLowerCase().replaceAll('ё', 'е').replaceAll('&amp;', '&');

export const buildGeniusQuery = (
	title: string,
	mainArtists: { name: string }[],
	featuredArtists: string[] = []
): string => {
	const normalizedTitle = normalizeString(title);
	const artistNames = mainArtists.map((artist) => normalizeString(artist.name));
	const query = normalizedTitle + ' ' + artistNames.concat(featuredArtists).join(' ');

	return normalizeString(query);
};

interface GetGeniusLyricsProps extends Pick<AudioObject, 'title' | 'mainArtists' | 'performer'> {
	featuredArtists?: string[];
	signal?: AbortSignal;
}

const getGeniusLyrics = async ({
	title,
	mainArtists,
	featuredArtists,
	performer,
	signal,
}: GetGeniusLyricsProps): Promise<string> => {
	const query = buildGeniusQuery(
		title,
		performer ? [{ name: performer }] : typeof mainArtists === 'string' ? [{ name: mainArtists }] : mainArtists,
		featuredArtists
	);

	if (cache.has(query)) {
		return cache.get(query)!;
	}

	let response: any;

	try {
		const fResp = await fetch('https://api.genius.com/search?' + new URLSearchParams({ q: query }), { signal });
		if (fResp.status !== 200) return '';

		response = await fResp.json();
	} catch (error) {
		console.error('Error fetching search results:', error);
		return '';
	}

	const hits = response?.response?.hits || [];
	let hit = hits.find((hit: any) => {
		const hitTitle = normalizeString(hit?.result?.title);
		return hitTitle === normalizeString(title);
	});

	if (!hit) {
		const inaccuracies: number[] = [];
		const filteredHits = hits.filter((hit: any) => {
			if (hit?.result?.title) {
				const title = normalizeString(
					hit.result.full_title || [hit.result.title, hit.result.artist_names].filter((i: any) => i).join(' ')
				);
				const inaccuracy = query.split(' ').filter((i: string) => !title.includes(i)).length;
				const isMatch = inaccuracy < 3;

				if (isMatch) {
					inaccuracies.push(inaccuracy);
				}

				return isMatch;
			}

			return false;
		});

		let minInaccuracy = 4;
		for (const [index, inaccuracy] of Object.entries(inaccuracies)) {
			if (minInaccuracy > inaccuracy) {
				minInaccuracy = inaccuracy;
				hit = filteredHits[index];
			}
		}
	}

	if (!hit) {
		cache.set(query, '');
		return '';
	}

	const resultId = hit.result?.id;
	if (!resultId) {
		cache.set(query, '');
		return '';
	}

	try {
		response = await fetch(`https://api.genius.com/songs/${resultId}?text_format=plain`, { signal });
		response = await response.json();
	} catch (error) {
		console.error('Error fetching song details:', error);
		return '';
	}
	const lyrics = response?.response?.song?.lyrics?.plain?.trim() || '';

	cache.set(query, lyrics);

	return lyrics;
};

export default getGeniusLyrics;
