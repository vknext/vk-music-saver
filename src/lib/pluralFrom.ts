const pluralFrom = (count: number, wordForms: string[], need_count = true, need_cases = true) => {
	return `${need_count ? count : ''} ${
		need_cases
			? wordForms[4 < count % 100 && count % 100 < 20 ? 2 : [2, 0, 1, 1, 1, 2][Math.min(count % 10, 5)]]
			: ''
	}`.trim();
};

export default pluralFrom;
