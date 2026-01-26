import getIcon12Cancel from 'src/icons/getIcon12Cancel';
import getIcon16Cancel from 'src/icons/getIcon16Cancel';
import getIcon20DownloadOutline from 'src/icons/getIcon20DownloadOutline';
import getIcon20Spinner from 'src/icons/getIcon20Spinner';
import getIcon24DownloadOutline from 'src/icons/getIcon24DownloadOutline';
import getIcon24Spinner from 'src/icons/getIcon24Spinner';
import lang from 'src/lang';
import styles from './index.module.scss';

interface DownloadAudioButtonResult {
	setIsLoading: (isLoading: boolean) => void;
	getIsLoading: () => boolean;
	setText: (text: string) => void;
	element: HTMLButtonElement;
}

const SpinnerIcons = {
	20: getIcon20Spinner,
	24: getIcon24Spinner,
};

const DownloadOutlineIcons = {
	20: getIcon20DownloadOutline,
	24: getIcon24DownloadOutline,
};

const CancelIcons = {
	20: getIcon12Cancel,
	24: getIcon16Cancel,
};

export interface CreateDownloadAudioButtonParams {
	iconSize?: keyof typeof SpinnerIcons;
	enableDefaultText?: boolean;
	cancelable?: boolean;
}

const createDownloadAudioButton = ({
	iconSize = 20,
	enableDefaultText = true,
	cancelable = false,
}: CreateDownloadAudioButtonParams = {}): DownloadAudioButtonResult => {
	let isLoading = false;

	const getIconSpinner = SpinnerIcons[iconSize];
	const getIconDownloadOutline = DownloadOutlineIcons[iconSize];
	const getIconCancel = CancelIcons[iconSize];

	const downloadItem = document.createElement('button');
	downloadItem.className = styles.DownloadAudioButton;

	downloadItem.style.setProperty('--icon-size', `${iconSize}px`);

	const sizeEl = document.createElement('span');
	sizeEl.className = styles.DownloadAudioButton__size;

	if (enableDefaultText) {
		sizeEl.innerText = lang.use('vms_loading');
	}

	const iconsEl = document.createElement('div');
	iconsEl.className = styles.DownloadAudioButton__icons;

	const downloadIcon = getIconDownloadOutline();
	downloadIcon.classList.add(styles['DownloadAudioButton__icon--download']);

	const loadingIcon = getIconSpinner();
	loadingIcon.classList.add(styles['DownloadAudioButton__icon--spinner']);

	iconsEl.append(downloadIcon, loadingIcon);

	if (cancelable) {
		const cancelIcon = getIconCancel();
		cancelIcon.classList.add(styles['DownloadAudioButton__icon--cancel']);

		iconsEl.appendChild(cancelIcon);
	}

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
