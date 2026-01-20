// eslint-disable-next-line no-control-regex
const invisibleRegex = /[\x00-\x1F\u200b-\u200f\ufeff\u202a-\u202e\u00ad]/g;

const forbiddenRegex = /\/|\\|:|\*|\?|"|<|>|\||\+|%|@|@\\0/g;

const fixFilename = (fileName: string): string => {
	return fileName.replaceAll(invisibleRegex, '').replaceAll(forbiddenRegex, '_').trim();
};

export default fixFilename;
