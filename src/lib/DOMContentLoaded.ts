const DOMContentLoaded = (onload: () => unknown): void => {
	if (document.readyState !== 'loading') {
		onload();
	} else {
		document.addEventListener('DOMContentLoaded', onload, { once: true });
	}
};

export default DOMContentLoaded;
