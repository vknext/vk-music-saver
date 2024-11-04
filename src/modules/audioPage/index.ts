import downloadAudio from 'src/downloaders/downloadAudio';
import createDownloadAudioButton from 'src/elements/createDownloadAudioButton';
import waitGlobalVariable from 'src/globalVars/utils/waitGlobalVariable';
import onAddAudioPagePlayerWrap from 'src/interactions/onAddAudioPagePlayerWrap';
import onOpenPlaylistPage from 'src/interactions/onOpenPlaylistPage';
import lang from 'src/lang';
import cancelEvent from 'src/lib/cancelEvent';
import formatFFMpegProgress from 'src/lib/formatFFMpegProgress';
import humanFileSize from 'src/lib/humanFileSize';
import getAudioBitrate from 'src/musicUtils/getAudioBitrate';
import getAudioPlayerUserControlsContainer from './getAudioPlayerUserControlsContainer';

interface WrapElement extends HTMLElement {
	_vms_inj?: boolean;
}

const getCurrentAudioObject = () => {
	return window.AudioUtils.audioTupleToAudioObject(window.ap.getCurrentAudio());
};

const onAddPlayer = async (playerWrap: WrapElement) => {
	if (playerWrap._vms_inj) return;
	playerWrap._vms_inj = true;

	const container = await getAudioPlayerUserControlsContainer(playerWrap);

	const { setIsLoading, setText, element, getIsLoading } = createDownloadAudioButton();

	const wrapper = document.createElement('div');
	wrapper.style.paddingRight = '12px';
	wrapper.appendChild(element);

	container.prepend(wrapper);

	element.addEventListener('click', (event) => {
		cancelEvent(event);

		if (getIsLoading()) return;

		const audioObject = getCurrentAudioObject();
		if (!audioObject) return;

		setIsLoading(true);
		setText(lang.use('vms_loading'));

		downloadAudio({
			audioObject,
			onProgress: (progress) => {
				setText(formatFFMpegProgress(progress));
			},
		}).finally(() => {
			setIsLoading(false);
			updateText().catch(console.error);
		});
	});

	const updateText = async () => {
		const currentAudioObject = getCurrentAudioObject();
		if (!currentAudioObject) {
			setText('');
			return;
		}

		setText(lang.use('vms_loading'));

		const result = await getAudioBitrate(currentAudioObject);
		if (result?.size) {
			setText(humanFileSize(result.size, 2));
		} else {
			setText('');
		}
	};

	updateText().catch(console.error);

	await waitGlobalVariable('ap');

	window.ap.on(null, 'curr', () => {
		updateText();
	});
};

const initAudioPage = () => {
	onAddAudioPagePlayerWrap(onAddPlayer);

	onOpenPlaylistPage(() => {
		for (const wrap of document.querySelectorAll<HTMLElement>(
			'[data-testid="audioplayerblocksectionslayout"],[class*="AudioPlayerBlockSectionsLayout__root"]'
		)) {
			onAddPlayer(wrap);
		}
	});
};

export default initAudioPage;
