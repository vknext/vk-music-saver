export type WindowVariables = keyof (Window & typeof globalThis);

type Callback<T> = (newValue: T) => void;

const globalCallbacks = new Map<WindowVariables, Set<Callback<any>>>();

const removeCallback = (variable: WindowVariables, callback: Callback<any>) => {
	const callbackSet = globalCallbacks.get(variable);

	if (callbackSet) {
		callbackSet.delete(callback);
	}
};

interface definePropertyProps<V, T> {
	variable: V;
	getValue: () => T;
	setValue: (value: T) => void;
	enumerable: boolean;
}

const defineProperty = <T extends WindowVariables>(props: definePropertyProps<T, (typeof window)[T]>) => {
	const { variable, getValue, setValue, enumerable } = props;

	Object.defineProperty(window, variable, {
		get: getValue,
		set: (value) => {
			setValue(value);

			if (!enumerable) {
				props.enumerable = true;

				defineProperty(props);
			}

			return true;
		},
		configurable: true,
		enumerable,
	});
};

const watchGlobalProperty = <T extends WindowVariables>(variable: T, callback: (value: (typeof window)[T]) => void) => {
	if (globalCallbacks.has(variable)) {
		const callbackSet = globalCallbacks.get(variable)!;

		callbackSet.add(callback);

		return () => removeCallback(variable, callback);
	}

	const callbackSet = new Set<Callback<any>>();
	callbackSet.add(callback);

	globalCallbacks.set(variable, callbackSet);

	let variableValue = window[variable];

	if (variableValue) {
		callback(variableValue);
	}

	defineProperty({
		variable,
		enumerable: variable in window,
		getValue: () => variableValue,
		setValue: (value) => {
			variableValue = value;

			for (const callback of callbackSet) {
				callback(value);
			}
		},
	});

	return () => removeCallback(variable, callback);
};

export default watchGlobalProperty;
