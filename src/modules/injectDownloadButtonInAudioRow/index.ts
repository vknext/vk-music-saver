import downloadAudio from 'src/downloaders/downloadAudio';
import createDownloadAudioButton, {
	type CreateDownloadAudioButtonParams,
} from 'src/elements/createDownloadAudioButton';
import type { AudioObject } from 'src/global';
import waitAudioUtils from 'src/globalVars/waitAudioUtils';
import onAddAudioRow from 'src/interactions/onAddAudioRow';
import onAddAudioRowReact from 'src/interactions/onAddAudioRowReact';
import lang from 'src/lang';
import cancelEvent from 'src/lib/cancelEvent';
import formatFFMpegProgress from 'src/lib/formatFFMpegProgress';
import humanFileSize from 'src/lib/humanFileSize';
import getAudioBitrate from 'src/musicUtils/getAudioBitrate';
import type { AudioAudio } from 'src/schemas/objects';

interface RowInnerElement extends HTMLElement {
	_vms_inj?: boolean;
}

const createDownloadButton = (
	audio: AudioAudio | AudioObject,
	iconSize?: CreateDownloadAudioButtonParams['iconSize']
) => {
	const { setIsLoading, setText, element, getIsLoading } = createDownloadAudioButton({ iconSize });

	const updateBitrate = async () => {
		const result = await getAudioBitrate(audio);
		if (result?.size) {
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
			onProgress: async (progress) => {
				setText(formatFFMpegProgress(progress));
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

	if (rowInnerEl._vms_inj) {
		return;
	}
	rowInnerEl._vms_inj = true;

	rowInnerEl.appendChild(createDownloadButton(audioObject));
};

const onAddReactRow = async (audioRow: HTMLElement, audio: AudioAudio | null) => {
	if (!audio) {
		console.error('no audio', { audioRow });
		return;
	}

	const actions = audioRow.querySelector<RowInnerElement>('[class*="AudioRow__actions--"]');
	if (!actions) return;
	if (actions._vms_inj) return;
	actions._vms_inj = true;

	const vkuiButtonGroup = actions.querySelector<HTMLElement>('.vkuiButtonGroup,.vkuiButtonGroup__host');

	const downloadItem = createDownloadButton(audio, 24);

	(vkuiButtonGroup || actions).prepend(downloadItem);
};

const injectDownloadButtonInAudioRow = () => {
	onAddAudioRow(onAddRow);
	onAddAudioRowReact(onAddReactRow);
};

export default injectDownloadButtonInAudioRow;
