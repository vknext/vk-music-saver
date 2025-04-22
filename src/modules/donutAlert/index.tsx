import initReactApp from 'src/react/initReactApp';
import { getVMSConfig } from 'src/services/getVMSConfig';
import GlobalStorage from 'src/storages/GlobalStorage';
import waitForDownloadMilestone from '../ratingAlert/waitForDownloadMilestone';

let isShown = false;
const showAlert = async () => {
	if (isShown) return;
	isShown = true;

	const { DonutAlert } = await import('./DonutAlert');
	const appRoot = document.createElement('div');

	document.body.appendChild(appRoot);

	const { unmount } = await initReactApp({
		root: appRoot,
		content: (
			<DonutAlert
				onDestroy={() => {
					unmount();
					appRoot.remove();
				}}
				onButtonClick={() => GlobalStorage.setValue('donut_alert_shown', true)}
			/>
		),
		disableParentTransformForPositionFixedElements: true,
		disableAnchorTextDecoration: true,
	});
};

const init = async () => {
	if (await GlobalStorage.getValue('donut_alert_shown', false)) return;

	const config = await getVMSConfig();

	if (config.alerts.donut && (await waitForDownloadMilestone(10, 4))) {
		await showAlert();
	}
};

init().catch(console.error);
