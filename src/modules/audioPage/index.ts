import waitVariable from '@vknext/shared/vkcom/globalVars/utils/waitVariable';
import downloadAudio from 'src/downloaders/downloadAudio';
import downloadUserAudio from 'src/downloaders/downloadUserAudio';
import createDownloadAudioButton from 'src/elements/createDownloadAudioButton';
import getIcon24DownloadOutline from 'src/icons/getIcon24DownloadOutline';
import onAddAudioPagePlayerWrap from 'src/interactions/onAddAudioPagePlayerWrap';
import onOpenPlaylistPage from 'src/interactions/onOpenPlaylistPage';
import lang from 'src/lang';
import cancelEvent from 'src/lib/cancelEvent';
import humanFileSize from 'src/lib/humanFileSize';
import getAudioBitrate from 'src/musicUtils/getAudioBitrate';
import getAudioPlayerUserControlsContainer from './getAudioPlayerUserControlsContainer';
import styles from './index.module.scss';

interface WrapElement extends HTMLElement {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[key: string | symbol]: any;
}

const getCurrentAudioObject = () => {
	return window.AudioUtils.audioTupleToAudioObject(window.ap.getCurrentAudio());
};

const uniqueKey = Symbol();

const addButtonDownloadAllMusic = () => {
	const tabsActions = document.getElementsByClassName('audio_section_tabs_actions');
	for (const actions of tabsActions) {
		if (actions.getElementsByClassName(styles.AudioPageMainTabBtn).length) continue;

		const btn = document.createElement('button');
		btn.className = styles.AudioPageMainTabBtn;

		btn.addEventListener('click', () => downloadUserAudio(window.cur.oid || window.vk.id).catch(console.error));

		btn.addEventListener('mouseover', function () {
			window.showTooltip(this, {
				text: lang.use('vms_download_all_my_music'),
				black: 1,
				noZIndex: true,
				needLeft: true,
				shift: [5, 2],
			});
		});

		btn.appendChild(getIcon24DownloadOutline());

		actions.prepend(btn);
	}

	if (tabsActions.length === 0) {
		const headerExtra = document.querySelector<HTMLElement>(
			'.audio_page_content_block_wrap .page_block_h2 .page_block_header_extra'
		);
		if (headerExtra) {
			const btn = document.createElement('button');
			btn.className = styles.AudioPageMainTabBtn;

			btn.addEventListener('click', () => downloadUserAudio(window.cur.oid || window.vk.id).catch(console.error));

			btn.addEventListener('mouseover', function () {
				window.showTooltip(this, {
					text: lang.use('vms_download_all_music'),
					black: 1,
					noZIndex: true,
					needLeft: true,
					shift: [5, 2],
				});
			});

			btn.appendChild(getIcon24DownloadOutline());

			headerExtra.appendChild(btn);
		}
	}
};

const onAddPlayer = async (playerWrap: WrapElement) => {
	if (playerWrap[uniqueKey]) return;
	playerWrap[uniqueKey] = true;

	if (
		location.pathname.startsWith('/audios') ||
		location.pathname === '/audio' ||
		playerWrap.closest('.top_audio_layer_place,#top_audio_layer_place')
	) {
		addButtonDownloadAllMusic();
	}

	// текущий трек из плеера
	const container = await getAudioPlayerUserControlsContainer(playerWrap);
	if (!container) return;

	const { setIsLoading, setText, element, getIsLoading } = createDownloadAudioButton();

	if (container.getElementsByClassName(element.className).length) return;

	let size: number | undefined = undefined;

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
			size,
			onProgress: (progress) => {
				setText(`${progress}%`);
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
			size = result.size;

			setText(humanFileSize(result.size, 2));
		} else {
			setText('');
		}
	};

	updateText().catch(console.error);

	await waitVariable('ap');

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
