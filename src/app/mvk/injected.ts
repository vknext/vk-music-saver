import { onDocumentComplete } from '@vknext/shared/utils/onDocumentComplete';
import '../public-path';

import getGlobalVKNext from 'src/getGlobalVKNext';

// сообщаем VK Next, что нужно отключить отображение кнопок скачивания даже если он не работает на mvk
getGlobalVKNext().vms_installed = true;

const STORAGE_KEY = 'vms_vmk_warning';
const MAX_SHOWS = 10;

const currentCount = Number(window.localStorage.getItem(STORAGE_KEY)) || 0;

if (currentCount < MAX_SHOWS) {
	onDocumentComplete(async () => {
		await import('./showWarning');

		window.localStorage.setItem(STORAGE_KEY, String(currentCount + 1));
	});
}
