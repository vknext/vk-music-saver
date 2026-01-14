import { StreamSaver } from '@vknext/shared/lib/streamSaver/saver';
import { getRuntimeURL } from 'src/common/getRuntimeURL';

export const streamSaver = new StreamSaver({
	getMitmUrl: async () => {
		return getRuntimeURL('mitm.html');
	},
});
