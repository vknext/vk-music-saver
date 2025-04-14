import initReactApp from 'src/react/initReactApp';
import { useDownloadStore } from 'src/store/useDownloadStore';
import styles from './index.module.scss';

const wrapper = document.createElement('li');
wrapper.className = 'HeaderNav__item';

let unmountApp: (() => void) | undefined;

const renderManager = async () => {
	if (wrapper.parentElement) {
		return;
	}

	const headerNav = document.querySelector<HTMLElement>('.HeaderNav,#top_nav');

	if (!headerNav) {
		console.error('HeaderNav not found');
		return;
	}

	const audioEl = headerNav.querySelector<HTMLElement>('.HeaderNav__audio');

	if (audioEl) {
		audioEl.insertAdjacentElement('afterend', wrapper);
		wrapper.style.order = '';
	} else {
		headerNav.appendChild(wrapper);
		wrapper.style.order = '-1';
	}

	if (unmountApp) {
		unmountApp();
	}

	const { default: DownloadManager } = await import('src/react/components/DownloadManager/DownloadManager');

	const { unmount } = await initReactApp({
		root: wrapper,
		content: <DownloadManager />,
		disableParentTransformForPositionFixedElements: true,
		disablePortal: true,
		wrapperProps: { className: styles.HeaderNavItem__children },
	});

	unmountApp = unmount;
};

const removeManager = () => {
	wrapper.remove();

	if (unmountApp) {
		unmountApp();
	}
};

useDownloadStore.subscribe((state) => {
	if (state.tasks.size > 0) {
		renderManager();
	} else {
		removeManager();
	}
});
