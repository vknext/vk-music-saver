import { vknextApi } from 'src/api';
import type { VMSGetConfigResponse } from 'src/api/vknext/types';

let savedPromise: Promise<VMSGetConfigResponse> | null = null;

export const getVMSConfig = () => {
	if (savedPromise) return savedPromise;

	savedPromise = vknextApi.call('vms.getConfig', {});

	savedPromise.then((config) => {
		if ('error' in config) {
			savedPromise = null;
		}
	});

	savedPromise.catch(() => {
		savedPromise = null;
	});

	return savedPromise;
};
