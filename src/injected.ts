import './public-path';

import injectDownloadButtonInAudioRow from './modules/injectDownloadButtonInAudioRow';
import initShowBitrateNearDuration from './modules/showBitrateNearDuration';

import './injected.scss';

import getGlobalVKNext from './getGlobalVKNext';
import initAudioPage from './modules/audioPage';
import initAudioPlaylist from './modules/audioPlaylist';
import initFeed from './modules/feed';
import initVKNextBanner from './modules/vknextBanner';

// сообщаем VK Next, что нужно отключить отображение кнопок скачивания
getGlobalVKNext().vms_installed = true;

const start = async () => {
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
		await initAudioPlaylist();
	} catch (e) {
		console.error('[VMS/initAudioPlaylist]', e);
	}

	try {
		initFeed();
	} catch (e) {
		console.error('[VMS/initFeed]', e);
	}

	try {
		if (!('webpack' in getGlobalVKNext())) {
			initVKNextBanner();
		}
	} catch (e) {
		console.error('[VMS/initVKNextBanner]', e);
	}
};

start().catch(console.error);
