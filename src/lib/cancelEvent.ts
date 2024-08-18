type Events = Event | KeyboardEvent | MouseEvent;

const cancelEvent = (event: Events) => {
	event = event as MouseEvent;

	event.preventDefault?.();
	event.stopPropagation?.();
	event.stopImmediatePropagation?.();
};

export default cancelEvent;
