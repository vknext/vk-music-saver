import downloadAudio from 'src/downloaders/downloadAudio';
import createDownloadAudioButton from 'src/elements/createDownloadAudioButton';
import onAddAudioRow from 'src/interactions/onAddAudioRow';
import lang from 'src/lang';
import cancelEvent from 'src/lib/cancelEvent';
import formatFFMpegProgress from 'src/lib/formatFFMpegProgress';
import humanFileSize from 'src/lib/humanFileSize';
import getAudioBitrate from 'src/musicUtils/getAudioBitrate';

interface RowInnerElement extends HTMLElement {
	_vms_inj?: boolean;
}

const onAddRow = async (row: HTMLElement) => {
	const audio = row.dataset.audio;
	if (!audio) return;

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

	const { setIsLoading, setText, element, getIsLoading } = createDownloadAudioButton();

	const updateBitrate = async () => {
		const result = await getAudioBitrate(audioObject);
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
			audioObject,
			onProgress: async (progress) => {
				setText(formatFFMpegProgress(progress));
			},
		}).finally(() => {
			setIsLoading(false);

			updateBitrate().catch(console.error);
		});
	});

	rowInnerEl.appendChild(element);

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
};

const injectDownloadButtonInAudioRow = () => {
	onAddAudioRow(onAddRow);
};

export default injectDownloadButtonInAudioRow;
