const arrayUnFlat = <T>(src: T[], length = 100): T[][] => {
	const array = [...src];
	const result = [];

	while (array.length) {
		result.push(array.splice(0, length || array.length));
	}

	return result;
};

export default arrayUnFlat;
