import CustomModalPageProvider from '../components/CustomModalPage/CustomModalPageContext';
import initReactApp from '../initReactApp';
import styles from './index.module.scss';
import { disableBodyScroll, enableBodyScroll } from './scroll';
import type { ShowReactModalFunc } from './types';

const Z_INDEX_PROPERTY = '--vms--z_index_modal';

const showReactModal: ShowReactModalFunc = async (Modal, { zIndex } = {}) => {
	const appRoot = document.createElement('div');
	const portal = document.createElement('div');

	if (zIndex) {
		appRoot.className = styles.ReactModal__zIndex;
		portal.className = styles.ReactModal__zIndex;

		portal.style.setProperty(Z_INDEX_PROPERTY, zIndex.toString());
		appRoot.style.setProperty(Z_INDEX_PROPERTY, zIndex.toString());
	}

	document.body.appendChild(appRoot);
	document.body.appendChild(portal);

	const { unmount } = await initReactApp({
		root: appRoot,
		portal,
		content: (
			<CustomModalPageProvider
				onOpen={disableBodyScroll}
				onClosed={() => {
					setTimeout(() => enableBodyScroll(), 100);

					setTimeout(() => {
						unmount();

						appRoot.remove();
						portal.remove();
					}, 1000);
				}}
			>
				{typeof Modal === 'function' ? <Modal /> : Modal}
			</CustomModalPageProvider>
		),
		disableParentTransformForPositionFixedElements: true,
		disableAnchorTextDecoration: true,
	});
};

export default showReactModal;
