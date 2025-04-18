import initReactApp from 'src/react/initReactApp';
import GlobalStorage from 'src/storages/GlobalStorage';
import getTopProfileLink from './getTopProfileLink';
import styles from './index.module.scss';

const start = async () => {
	const isSeen = await GlobalStorage.getValue('onboarding_settings_hint_seen', false);
	if (isSeen) return;

	const topProfileLink = getTopProfileLink();
	if (!topProfileLink) return;

	const Hint = await import('./Hint');

	const wrapper = document.createElement('div');
	wrapper.className = styles.Wrapper;

	topProfileLink.insertAdjacentElement('afterend', wrapper);

	const { unmount } = await initReactApp({
		root: wrapper,
		content: <Hint.default onDestroy={() => unmount()} />,
		disableParentTransformForPositionFixedElements: true,
	});
};

requestAnimationFrame(start);
