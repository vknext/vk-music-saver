import { onDocumentComplete } from '@vknext/shared/utils/onDocumentComplete';
import '../public-path';

import getGlobalVKNext from 'src/getGlobalVKNext';
import { MVK_WARNING_STORAGE_KEY } from './constants';

// сообщаем VK Next, что нужно отключить отображение кнопок скачивания даже если он не работает на mvk
getGlobalVKNext().vms_installed = true;

const isEnabled = window.localStorage.getItem(MVK_WARNING_STORAGE_KEY) !== 'true';

if (isEnabled) {
	onDocumentComplete(async () => {
		await import('./showWarning');
	});
}
