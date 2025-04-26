import { waitVK } from '@vknext/shared/vkcom/globalVars/waitVK';
import { waitVKApi } from '@vknext/shared/vkcom/globalVars/waitVKApi';
import type { AppsGetAppLaunchParamsResponse } from 'src/schemas/responses';
import GlobalStorage from 'src/storages/GlobalStorage';
import getAuthAppId from './getAuthAppId';
import vknextApiUrl from './vknextApiUrl';

/**
 * Упрощенная реализация, существенно отличается от версии из VK Next.
 *
 * ⚠️ Использовать только в публичных проектах.
 */
export class VKNextApi {
	private appId: number | null = null;
	private params: string | null = null;

	async call<T>(method: `vms.${string}`, params?: Record<string, any>, signal?: AbortSignal): Promise<T> {
		const response = await fetch(`${vknextApiUrl}/${method}`, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'VK-Agent': await this.getVKAgent(),
				'VK-Id': String(await this.getVKId()),
				'Api-Version': 'vms-1',
			},
			body: JSON.stringify(params),
			credentials: 'include',
			signal,
		});

		const contentType = response.headers.get('Content-Type');

		if (contentType?.includes('audio/')) {
			return (await response.blob()) as T;
		}

		return await response.json();
	}

	private async getAppId(): Promise<number> {
		if (this.appId) return this.appId;

		const appId = await getAuthAppId();

		this.appId = appId;

		return appId;
	}

	private async getVKAgent(): Promise<string> {
		if (this.params) return this.params;

		const appId = await this.getAppId();

		const viewUrlCache = await GlobalStorage.getValue(`params_${appId}`, null);

		if (viewUrlCache) {
			return viewUrlCache;
		}

		const vkApi = await waitVKApi();

		const paramsObject = await vkApi.api<AppsGetAppLaunchParamsResponse>('apps.getAppLaunchParams', {
			mini_app_id: appId,
			referer: 'other',
			v: '5.123',
		});

		const params = new URLSearchParams(Object.entries(paramsObject)).toString();

		this.params = params;

		await GlobalStorage.setValue(`params_${appId}`, params);

		return params;
	}

	async getVKId(): Promise<number> {
		const vk = await waitVK();
		return vk.id || 0;
	}
}
