import { waitVK } from '@vknext/shared/vkcom/globalVars/waitVK';
import { waitVKApi } from '@vknext/shared/vkcom/globalVars/waitVKApi';
import type { AppsGetEmbeddedUrlResponse } from 'src/schemas/responses';
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
	private viewUrl: string | null = null;

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
		if (this.viewUrl) return this.viewUrl;

		const appId = await this.getAppId();

		const viewUrlCache = await GlobalStorage.getValue(`view_url_${appId}`, null);

		if (viewUrlCache) {
			return viewUrlCache;
		}

		const vkApi = await waitVKApi();

		const { view_url } = await vkApi.api<AppsGetEmbeddedUrlResponse>('apps.getEmbeddedUrl', {
			app_id: appId,
			v: '5.123',
		});

		this.viewUrl = view_url;

		await GlobalStorage.setValue(`view_url_${appId}`, view_url);

		return view_url;
	}

	private async getVKId(): Promise<number> {
		const vk = await waitVK();
		return vk.id || 0;
	}
}
