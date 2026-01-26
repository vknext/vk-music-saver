interface HumanFileSizeOptions {
	decimals?: number;
	units: readonly string[];
	threshold?: number;
	separator?: string;
}

const humanFileSize = (bytes: number, options: HumanFileSizeOptions): string => {
	const { decimals = 1, units, threshold = 1024, separator = ' ' } = options;

	if (!Number.isFinite(bytes) || bytes === 0) return `0${separator}${units[0]}`;

	const isNegative = bytes < 0;
	let value = Math.abs(bytes);
	let unitIndex = 0;

	while (value >= threshold && unitIndex < units.length - 1) {
		value /= threshold;
		unitIndex++;
	}

	const actualDecimals = unitIndex === 0 ? 0 : decimals;
	let formattedValue = value.toFixed(actualDecimals);

	if (parseFloat(formattedValue) >= threshold && unitIndex < units.length - 1) {
		formattedValue = (1).toFixed(actualDecimals);
		unitIndex++;
	}

	return `${isNegative ? '-' : ''}${formattedValue}${separator}${units[unitIndex]}`;
};

export default humanFileSize;
