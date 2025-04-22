import './public-path';

import './index.scss';

import { DOMContentLoaded } from '@vknext/shared/utils/DOMContentLoaded';
import { onDocumentComplete } from '@vknext/shared/utils/onDocumentComplete';
import getGlobalVKNext from 'src/getGlobalVKNext';

import initAudioPage from 'src/modules/audioPage';
import initAudioPlaylist from 'src/modules/audioPlaylist';
import initConvoProfile from 'src/modules/convoProfile';
import initFeed from 'src/modules/feed';
import injectDownloadButtonInAudioRow from 'src/modules/injectDownloadButtonInAudioRow';
import initShowBitrateNearDuration from 'src/modules/showBitrateNearDuration';

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
		initConvoProfile();
	} catch (e) {
		console.error(['[VMS/initConvoProfile]', e], e);
	}
};

start().catch(console.error);

DOMContentLoaded(() => {
	import('src/modules/manager').catch((e) => console.error('[VMS/manager]', e));

	import('src/modules/topProfileMenuButtons').catch((e) => console.error('[VMS/topProfileMenuButtons]', e));

	// preload
	import('src/services/getVMSConfig').then(({ getVMSConfig }) => {
		getVMSConfig().catch(console.error);
	});
});

onDocumentComplete(() => {
	import('src/modules/settingsHint').catch((e) => console.error('[VMS/settingsHint]', e));

	import('src/modules/ratingAlert').catch((e) => console.error('[VMS/ratingAlert]', e));
	import('src/modules/donutAlert').catch((e) => console.error('[VMS/donutAlert]', e));
});
