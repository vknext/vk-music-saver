export default function getReactAttrs(element?: HTMLElement | null) {
	// TODO: придумать нормальную типизацию без any
	const attrs: {
		fiber?: any;
		props?: any;
		container?: any;
	} = {};

	if (!element) {
		return attrs;
	}

	for (const attr of Object.keys(element)) {
		if (attr.startsWith('__reactFiber')) {
			attrs.fiber = (element as any)[attr];
		}

		if (attr.startsWith('__reactProps')) {
			attrs.props = (element as any)[attr];
		}

		if (attr.startsWith('__reactContainer')) {
			attrs.container = (element as any)[attr];
		}
	}

	return attrs;
}
