import { createPromise } from '@vknext/shared/utils/createPromise';
import { vknextApi } from 'src/api';
import type { VMSGetConfigResponse } from 'src/api/vknext/types';

const configMock: VMSGetConfigResponse = {
	prime: { enabled: false, vk_donut: false },
	deluxe: { enabled: false, vk_donut: false },
	alerts: { rating: true, donut: true, subscribe: false, vmp: false },
};

let savedPromise: Promise<VMSGetConfigResponse> | null = null;

export const getVMSConfig = () => {
	if (savedPromise) return savedPromise;

	const { promise, resolve } = createPromise<VMSGetConfigResponse>();

	savedPromise = promise;

	(async () => {
		try {
			const vkId = await vknextApi.getVKId();
			if (vkId === 0) {
				return resolve(configMock);
			}

			const response = await vknextApi.call<VMSGetConfigResponse>('vms.getConfig', {});

			if ('error' in response) {
				console.error('[VMS/getVMSConfig]', response.error);

				resolve(configMock);
			} else {
				resolve(response);
			}
		} catch (e) {
			console.error(e);

			resolve(configMock);
		}
	})();

	return promise;
};
