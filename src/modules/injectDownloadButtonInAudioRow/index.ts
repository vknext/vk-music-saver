import downloadAudio from 'src/downloaders/downloadAudio';
import getIcon24Spinner from 'src/icons/getIcon24Spinner';
import onAddAudioRow from 'src/interactions/onAddAudioRow';
import cancelEvent from 'src/lib/cancelEvent';
import humanFileSize from 'src/lib/humanFileSize';
import getAudioBitrate from 'src/musicUtils/getAudioBitrate';
import getIcon24DownloadOutline from '../../icons/getIcon24DownloadOutline';
import * as styles from './index.module.scss';

const onAddRow = async (row: HTMLElement) => {
	const audio = row.dataset.audio;
	if (!audio) return;

	const audioObject = AudioUtils.audioTupleToAudioObject(JSON.parse(audio));
	if (!audioObject) return;

	if (audioObject?.restrictionStatus || row.classList.contains('audio_row__deleted')) {
		return;
	}

	const rowInnerEl = row.querySelector<HTMLElement>('.audio_row__inner');
	if (!rowInnerEl) return;

	if (rowInnerEl.getElementsByClassName(styles.audioRowDownloadItem).length) {
		return;
	}

	const downloadItem = document.createElement('div');
	downloadItem.className = styles.audioRowDownloadItem;

	let isLoading = false;
	downloadItem.addEventListener('click', (event) => {
		cancelEvent(event);

		if (isLoading) return;
		isLoading = true;

		downloadItem.classList.add(styles['audioRowDownloadItem--loading']);

		downloadAudio(audioObject).finally(() => {
			downloadItem.classList.remove(styles['audioRowDownloadItem--loading']);
			isLoading = false;
		});
	});

	const sizeEl = document.createElement('span');
	sizeEl.className = styles.audioRowDownloadItem__size;
	sizeEl.innerText = window.getLang?.('box_loading') || 'Загрузка...';

	const iconsEl = document.createElement('div');
	iconsEl.className = styles.audioRowDownloadItem__icons;

	const downloadIcon = getIcon24DownloadOutline();
	// Cannot set property className of #<SVGElement> which has only a getter
	downloadIcon.classList.add(styles['audioRowDownloadItem__icon--download']);

	const loadingIcon = getIcon24Spinner();
	loadingIcon.classList.add(styles['audioRowDownloadItem__icon--loading']);

	iconsEl.append(downloadIcon, loadingIcon);

	downloadItem.append(iconsEl, sizeEl);

	rowInnerEl.appendChild(downloadItem);

	const observer = new IntersectionObserver(
		async (entries, observer) => {
			entries.forEach(async (entry) => {
				if (entry.isIntersecting) {
					const result = await getAudioBitrate(audioObject);

					if (result?.size) {
						sizeEl.innerText = humanFileSize(result.size, 2);
					} else {
						sizeEl.innerText = '';
					}

					observer.unobserve(row);
				}
			});
		},
		{ threshold: 0.5 }
	);

	observer.observe(downloadItem);
};

const injectDownloadButtonInAudioRow = () => {
	onAddAudioRow(onAddRow);
};

export default injectDownloadButtonInAudioRow;
