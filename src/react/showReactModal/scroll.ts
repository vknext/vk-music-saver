let previousOverflowStyle: string | null = null;
let isScrollLocked = false;

export const disableBodyScroll = () => {
	if (!isScrollLocked) {
		isScrollLocked = true;
		previousOverflowStyle = window.getComputedStyle(document.body).overflow;
		document.body.style.overflow = 'hidden';
	}
};

export const enableBodyScroll = () => {
	if (isScrollLocked) {
		isScrollLocked = false;
		if (previousOverflowStyle !== null) {
			document.body.style.overflow = previousOverflowStyle;
			previousOverflowStyle = null;
		}
	}
};
