import downloadAudio from 'src/downloaders/downloadAudio';
import createDownloadAudioButton from 'src/elements/createDownloadAudioButton';
import waitGlobalVariable from 'src/globalVars/utils/waitGlobalVariable';
import onAddAudioPagePlayerWrap from 'src/interactions/onAddAudioPagePlayerWrap';
import lang from 'src/lang';
import cancelEvent from 'src/lib/cancelEvent';
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

	// текущий трек из плеера
	const audioPlayerBlockRoot = playerWrap.classList.contains('AudioPlayerBlock__root')
		? playerWrap
		: playerWrap.querySelector<HTMLElement>('.AudioPlayerBlock__root');

	if (!audioPlayerBlockRoot) return;

	const container = await getAudioPlayerUserControlsContainer(audioPlayerBlockRoot);

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

		downloadAudio(audioObject).finally(() => {
			setIsLoading(false);
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
};

export default initAudioPage;
