const THRESHOLD = 1024;
const UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

const humanFileSize = (bytes: number, decimalPlaces = 1): string => {
	if (Math.abs(bytes) < THRESHOLD) {
		return `${bytes.toFixed(decimalPlaces)} ${UNITS[0]}`;
	}

	let unitIndex = 0;
	const roundingFactor = 10 ** decimalPlaces;

	do {
		bytes /= THRESHOLD;
		unitIndex++;
	} while (
		Math.round(Math.abs(bytes) * roundingFactor) / roundingFactor >= THRESHOLD &&
		unitIndex < UNITS.length - 1
	);

	return `${bytes.toFixed(decimalPlaces)} ${UNITS[unitIndex]}`;
};

export default humanFileSize;
