import './public-path';

import injectDownloadButtonInAudioRow from './modules/injectDownloadButtonInAudioRow';
import initShowBitrateNearDuration from './modules/showBitrateNearDuration';

import './injected.scss';
import initLang from './lang';
import initAudioPage from './modules/audioPage';
import initAudioPlaylist from './modules/audioPlaylist';
import initVKNextBanner from './modules/vknextBanner';

// сообщаем VK Next, что нужно отключить отображение кнопок скачивания
(window.vknext = window.vknext || {}).vms_installed = true;

const start = async () => {
	try {
		await initLang();
	} catch (e) {
		console.error('[VMS/initLang]', e);
	}

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

	try {
		initAudioPlaylist();
	} catch (e) {
		console.error('[VMS/initAudioPlaylist]', e);
	}

	try {
		if (!('webpack' in window.vknext)) {
			initVKNextBanner();
		}
	} catch (e) {
		console.error('[VMS/initVKNextBanner]', e);
	}
};

start().catch(console.error);
