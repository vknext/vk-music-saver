/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 *
 * @deprecated 2023
 */
const objectHook = (obj: any, name: string, onChange: (variable: any) => void) => {
	if (!(name in obj)) {
		console.warn(`[VMS/objectHook]:`, obj, obj[name]);
		throw new Error(`[VMS/objectHook]: object "${name}" not found`);
	}

	let oldVariable = obj[name];

	try {
		onChange(oldVariable);
	} catch (e) {
		console.error(e);
	}

	Object.defineProperty(obj, name, {
		get() {
			return oldVariable;
		},
		set(v) {
			if (process.env.NODE_ENV === 'development') {
				console.log(`[VMS/objectHook]: Новое значение "${name}"`, v);
			}

			oldVariable = v;

			try {
				onChange(oldVariable);
			} catch (e) {
				console.error(e);
			}

			return oldVariable;
		},
	});

	return {
		remove: () => {
			delete obj[name];
			obj[name] = oldVariable;
		},
	};
};

export default objectHook;
