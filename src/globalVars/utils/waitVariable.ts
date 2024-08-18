import waitStaticManager from '../waitStaticManager';
import waitGlobalVariable, { WindowVariables } from './waitGlobalVariable';

const waitVariable = async <T extends WindowVariables>(variable: T, module?: string): Promise<(typeof window)[T]> => {
	if (module) {
		try {
			await waitStaticManager();

			await window.stManager.add([window.jsc(module)]);
		} catch (e) {
			console.error(e);
		}
	}

	return waitGlobalVariable(variable);
};

export default waitVariable;
