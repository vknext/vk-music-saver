import initReactApp from '../../react/initReactApp';
import type { BaseSnackbarProps } from './BaseSnackbar';
import styles from './index.module.scss';

type ShowSnackbarProps = Omit<BaseSnackbarProps, 'onClose'>;

const snackbarWrapper = document.createElement('div');
snackbarWrapper.className = styles.Snackbars;

const showSnackbar = async (props: ShowSnackbarProps) => {
	const BaseSnackbar = (await import('./BaseSnackbar')).default;

	if (!document.body.contains(snackbarWrapper)) {
		document.body.appendChild(snackbarWrapper);
	}

	const root = document.createElement('div');

	snackbarWrapper.appendChild(root);

	const { unmount } = await initReactApp({
		root,
		content: (
			<BaseSnackbar
				onClose={() => {
					unmount();
					root.remove();

					if (snackbarWrapper.children.length === 0) {
						snackbarWrapper.remove();
					}
				}}
				{...props}
			/>
		),
		disableParentTransformForPositionFixedElements: true,
		noStyling: true,
	});
};

export default showSnackbar;
