import { StreamSaver } from '@vknext/shared/lib/streamSaver/saver';
import { getRuntimeURL } from 'src/common/getRuntimeURL';

export const streamSaver = new StreamSaver({
	getMitmUrl: async () => {
		// hotfix TODO: придумать как определять динамически доступен ли navigator.serviceWorker для расширений
		return process.env.IS_FIREFOX ? 'https://vknext.net/saver' : getRuntimeURL('mitm.html');
	},
});
