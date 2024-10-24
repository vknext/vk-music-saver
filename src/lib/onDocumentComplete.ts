const onDocumentComplete = (onload: () => any): void => {
	if (document.readyState === 'complete') {
		onload();
		return;
	}

	const listener = () => {
		if (document.readyState === 'complete') {
			onload();

			document.removeEventListener('readystatechange', listener);
		}
	};

	document.addEventListener('readystatechange', listener);
};

export default onDocumentComplete;
