import '../public-path';

import './injected.scss';

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
		console.error('[VK Music Saver/initShowBitrateNearDuration]', e);
	}

	try {
		injectDownloadButtonInAudioRow();
	} catch (e) {
		console.error('[VK Music Saver/injectDownloadButtonInAudioRow]', e);
	}

	try {
		initAudioPage();
	} catch (e) {
		console.error('[VK Music Saver/initAudioPage]', e);
	}

	try {
		await initAudioPlaylist();
	} catch (e) {
		console.error('[VK Music Saver/initAudioPlaylist]', e);
	}

	try {
		initFeed();
	} catch (e) {
		console.error('[VK Music Saver/initFeed]', e);
	}

	try {
		initConvoProfile();
	} catch (e) {
		console.error(['[VK Music Saver/initConvoProfile]', e], e);
	}
};

start().catch(console.error);

DOMContentLoaded(() => {
	import('src/modules/manager').catch((e) => console.error('[VK Music Saver/manager]', e));

	import('src/modules/topProfileMenuButtons').catch((e) =>
		console.error('[VK Music Saver/topProfileMenuButtons]', e)
	);

	// preload
	import('src/services/getVMSConfig').then(({ getVMSConfig }) => {
		getVMSConfig().catch(console.error);
	});
});

onDocumentComplete(() => {
	import('src/modules/settingsInLeftMenu').catch((e) => console.error('[VK Music Saver/settingsInLeftMenu]', e));
	import('src/modules/settingsHint').catch((e) => console.error('[VK Music Saver/settingsHint]', e));

	import('src/modules/ratingAlert').catch((e) => console.error('[VK Music Saver/ratingAlert]', e));
	import('src/modules/donutAlert').catch((e) => console.error('[VK Music Saver/donutAlert]', e));
	import('src/modules/vmpOnboarding').catch((e) => console.error('[VK Music Saver/vmpOnboarding]', e));
	import('src/modules/subscribeAlert').catch((e) => console.error('[VK Music Saver/subscribeAlert]', e));
});
