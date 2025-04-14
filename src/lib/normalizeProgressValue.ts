const normalizeProgressValue = (current: number, min: number, max: number): number => {
	if (current < min) {
		return 0;
	} else if (current > max) {
		return 100;
	} else {
		return ((current - min) / (max - min)) * 100;
	}
};

export default normalizeProgressValue;
