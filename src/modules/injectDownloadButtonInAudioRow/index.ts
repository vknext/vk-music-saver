import { waitAudioUtils } from '@vknext/shared/vkcom/globalVars/waitAudioUtils';
import type { AudioObject } from '@vknext/shared/vkcom/types';
import downloadAudio from 'src/downloaders/downloadAudio';
import createDownloadAudioButton, {
	type CreateDownloadAudioButtonParams,
} from 'src/elements/createDownloadAudioButton';
import onAddAudioRow from 'src/interactions/onAddAudioRow';
import onAddAudioRowReact from 'src/interactions/onAddAudioRowReact';
import lang from 'src/lang';
import cancelEvent from 'src/lib/cancelEvent';
import humanFileSize from 'src/lib/humanFileSize';
import onCurBackHide from 'src/listeners/onCurBackHide';
import getAudioBitrate from 'src/musicUtils/getAudioBitrate';
import type { AudioAudio } from 'src/schemas/objects';

interface RowInnerElement extends HTMLElement {
	_vms_inj?: boolean;
}

interface AudioRowElement extends HTMLElement {
	_vms_obs?: MutationObserver;
}

const ACTIONS_SELECTOR = ['[class*="AudioRow__actions--"]', '[data-testid="audiorow-actions"]'].join(',');

const createDownloadButton = (
	audio: AudioAudio | AudioObject,
	iconSize?: CreateDownloadAudioButtonParams['iconSize']
) => {
	const { setIsLoading, setText, element, getIsLoading } = createDownloadAudioButton({ iconSize });

	let size: number | undefined = undefined;

	const updateBitrate = async () => {
		const result = await getAudioBitrate(audio);
		if (result?.size) {
			size = result.size;

			setText(humanFileSize(result.size, 2));
		} else {
			setText('');
		}
	};

	element.addEventListener('click', (event) => {
		cancelEvent(event);

		if (getIsLoading()) return;

		setIsLoading(true);
		setText(lang.use('vms_loading'));

		downloadAudio({
			audioObject: audio,
			size,
			onProgress: (progress) => {
				setText(`${progress}%`);
			},
		}).finally(() => {
			setIsLoading(false);

			updateBitrate().catch(console.error);
		});
	});

	const observer = new IntersectionObserver(
		async (entries, observer) => {
			entries.forEach(async (entry) => {
				if (entry.isIntersecting) {
					await updateBitrate();

					observer.unobserve(element);
				}
			});
		},
		{ threshold: 0.5 }
	);

	observer.observe(element);

	return element;
};

const onAddRow = async (row: HTMLElement) => {
	const audio = row.dataset.audio;
	if (!audio) return;

	const AudioUtils = await waitAudioUtils();

	const audioObject = AudioUtils.audioTupleToAudioObject(JSON.parse(audio));
	if (!audioObject) return;

	if (audioObject?.restrictionStatus || row.classList.contains('audio_row__deleted')) {
		return;
	}

	const rowInnerEl = row.querySelector<RowInnerElement>('.audio_row__inner');
	if (!rowInnerEl) return;

	if (rowInnerEl._vms_inj) return;
	rowInnerEl._vms_inj = true;

	rowInnerEl.appendChild(createDownloadButton(audioObject));
};

const onAddReactRowActions = (actions: RowInnerElement, audio: AudioAudio) => {
	if (actions._vms_inj) return;
	actions._vms_inj = true;

	const vkuiButtonGroup = actions.querySelector<HTMLElement>('.vkuiButtonGroup,.vkuiButtonGroup__host');

	const downloadItem = createDownloadButton(audio, 20);

	(vkuiButtonGroup || actions).prepend(downloadItem);
};

const onAddReactRow = async (audioRow: AudioRowElement, audio: AudioAudio | null) => {
	if (!audio) {
		console.error('no audio', { audioRow });
		return;
	}

	const actions = audioRow.querySelector<RowInnerElement>(ACTIONS_SELECTOR);

	if (actions) {
		return onAddReactRowActions(actions, audio);
	}

	if (audioRow._vms_obs) return;

	const obs = new MutationObserver(() => {
		const actions = audioRow.querySelector<RowInnerElement>(ACTIONS_SELECTOR);

		if (actions) {
			onAddReactRowActions(actions, audio);
			obs.disconnect();
		}
	});

	audioRow._vms_obs = obs;

	obs.observe(audioRow, { subtree: true, childList: true });

	onCurBackHide(() => obs.disconnect());
};

const injectDownloadButtonInAudioRow = () => {
	onAddAudioRow(onAddRow);
	onAddAudioRowReact(onAddReactRow);
};

export default injectDownloadButtonInAudioRow;
