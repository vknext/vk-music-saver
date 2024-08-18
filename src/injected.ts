import './public-path';

import initShowBitrateNearDuration from './modules/showBitrateNearDuration';

// сообщаем VK Next, что нужно отключить отображение кнопок скачивания
(window.vknext = window.vknext || {}).vms_installed = true;

try {
	initShowBitrateNearDuration();
} catch (e) {
	console.error('[VMS/initShowBitrateNearDuration]', e);
}
