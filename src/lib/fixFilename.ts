const regex = /\/|\\|:|\*|\?|"|<|>|\||\+|%|@|@\\0/g;

const fixFilename = (fileName: string): string => {
	return fileName.replaceAll(regex, '_');
};

export default fixFilename;
