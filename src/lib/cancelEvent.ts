type Events =
	| Event
	| KeyboardEvent
	| MouseEvent
	| React.KeyboardEvent<HTMLInputElement>
	| React.MouseEvent<HTMLElement, MouseEvent>
	| React.ChangeEvent<HTMLSelectElement>
	| React.MouseEvent<SVGSVGElement, MouseEvent>;

const cancelEvent = (event: Events) => {
	event = event as MouseEvent;

	event.preventDefault?.();
	event.stopPropagation?.();
	event.stopImmediatePropagation?.();
};

export default cancelEvent;
