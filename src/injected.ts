import './public-path';

import injectDownloadButtonInAudioRow from './modules/injectDownloadButtonInAudioRow';
import initShowBitrateNearDuration from './modules/showBitrateNearDuration';

import './injected.scss';
import initAudioPage from './modules/audioPage';

// сообщаем VK Next, что нужно отключить отображение кнопок скачивания
(window.vknext = window.vknext || {}).vms_installed = true;

try {
	initShowBitrateNearDuration();
} catch (e) {
	console.error('[VMS/initShowBitrateNearDuration]', e);
}

try {
	injectDownloadButtonInAudioRow();
} catch (e) {
	console.error('[VMS/injectDownloadButtonInAudioRow]', e);
}

try {
	initAudioPage();
} catch (e) {
	console.error('[VMS/initAudioPage]', e);
}
