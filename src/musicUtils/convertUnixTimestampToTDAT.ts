const convertUnixTimestampToTDAT = (unixTimestamp: number): string => {
	if (!unixTimestamp) return '';

	const date = new Date(unixTimestamp * 1000);

	const day = String(date.getUTCDate()).padStart(2, '0');
	const month = String(date.getUTCMonth() + 1).padStart(2, '0');

	return `${day}${month}`;
};

export default convertUnixTimestampToTDAT;
