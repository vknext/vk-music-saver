import type { VMSGetConfigResponse } from './vknext/types';
import { VKNextApi } from './vknext/VKNextApi';

export const vknextApi = new VKNextApi();

let savedConfig: Promise<VMSGetConfigResponse> | null = null;
export const getVMSConfig = () => {
	if (savedConfig) return savedConfig;

	savedConfig = vknextApi.call('vms.getConfig', {});

	savedConfig.then((config) => {
		if ('error' in config) {
			savedConfig = null;
		}
	});

	savedConfig.catch(() => {
		savedConfig = null;
	});

	return savedConfig;
};
