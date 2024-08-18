import downloadAudio from 'src/downloaders/downloadAudio';
import createDownloadAudioButton from 'src/elements/createDownloadAudioButton';
import onAddAudioRow from 'src/interactions/onAddAudioRow';
import cancelEvent from 'src/lib/cancelEvent';
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

	element.addEventListener('click', (event) => {
		cancelEvent(event);

		if (getIsLoading()) return;

		setIsLoading(true);

		downloadAudio(audioObject).finally(() => {
			setIsLoading(false);
		});
	});

	rowInnerEl.appendChild(element);

	const observer = new IntersectionObserver(
		async (entries, observer) => {
			entries.forEach(async (entry) => {
				if (entry.isIntersecting) {
					const result = await getAudioBitrate(audioObject);

					if (result?.size) {
						setText(humanFileSize(result.size, 2));
					} else {
						setText('');
					}

					observer.unobserve(row);
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
