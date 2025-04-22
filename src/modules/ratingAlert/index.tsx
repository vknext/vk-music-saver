import initReactApp from 'src/react/initReactApp';
import { getVMSConfig } from 'src/services/getVMSConfig';
import GlobalStorage from 'src/storages/GlobalStorage';
import waitForDownloadMilestone from './waitForDownloadMilestone';

let isShown = false;
const showAlert = async () => {
	if (isShown) return;
	isShown = true;

	const { RatingAlert } = await import('./RatingAlert');
	const appRoot = document.createElement('div');

	document.body.appendChild(appRoot);

	const { unmount } = await initReactApp({
		root: appRoot,
		content: (
			<RatingAlert
				onDestroy={() => {
					unmount();
					appRoot.remove();
				}}
				onButtonClick={() => GlobalStorage.setValue('rate_extension_alert_shown', true)}
			/>
		),
		disableParentTransformForPositionFixedElements: true,
		disableAnchorTextDecoration: true,
	});
};

const init = async () => {
	if (await GlobalStorage.getValue('rate_extension_alert_shown', false)) return;

	const config = await getVMSConfig();

	if (config.alerts.rating && (await waitForDownloadMilestone(3, 2))) {
		await showAlert();
	}
};

init().catch(console.error);
