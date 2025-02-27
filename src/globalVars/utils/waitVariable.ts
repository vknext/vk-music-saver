import createPromise from 'src/lib/createPromise';
import watchGlobalProperty, { type WindowVariables } from './watchGlobalProperty';

const waitVariable = async <T extends WindowVariables>(
	variable: T,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	_modulePath?: string
): Promise<(typeof window)[T]> => {
	const variableValue = window[variable];

	if (variableValue) {
		return Promise.resolve(variableValue);
	}

	const { promise, resolve } = createPromise<(typeof window)[T]>();

	const removeListener = watchGlobalProperty(variable, (value) => {
		resolve(value);

		removeListener();
	});

	return promise;
};

export default waitVariable;
