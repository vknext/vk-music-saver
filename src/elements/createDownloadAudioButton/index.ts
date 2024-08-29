import getIcon20DownloadOutline from 'src/icons/getIcon20DownloadOutline';
import getIcon20Spinner from 'src/icons/getIcon20Spinner';
import lang from 'src/lang';
import * as styles from './index.module.scss';

interface DownloadAudioButtonResult {
	setIsLoading: (isLoading: boolean) => void;
	getIsLoading: () => boolean;
	setText: (text: string) => void;
	element: HTMLButtonElement;
}

const createDownloadAudioButton = (): DownloadAudioButtonResult => {
	let isLoading = false;

	const downloadItem = document.createElement('button');
	downloadItem.className = styles.DownloadAudioButton;

	const sizeEl = document.createElement('span');
	sizeEl.className = styles.DownloadAudioButton__size;
	sizeEl.innerText = lang.use('vms_loading');

	const iconsEl = document.createElement('div');
	iconsEl.className = styles.DownloadAudioButton__icons;

	const downloadIcon = getIcon20DownloadOutline();
	downloadIcon.classList.add(styles['DownloadAudioButton__icon--download']);

	const loadingIcon = getIcon20Spinner();
	loadingIcon.classList.add(styles['DownloadAudioButton__icon--loading']);

	iconsEl.append(downloadIcon, loadingIcon);

	downloadItem.append(iconsEl, sizeEl);

	return {
		element: downloadItem,
		setIsLoading: (_isLoading: boolean) => {
			isLoading = _isLoading;

			if (_isLoading) {
				downloadItem.classList.add(styles['DownloadAudioButton--loading']);
			} else {
				downloadItem.classList.remove(styles['DownloadAudioButton--loading']);
			}
		},
		getIsLoading: () => isLoading,
		setText: (text: string) => {
			sizeEl.innerText = text;
		},
	};
};

export default createDownloadAudioButton;
