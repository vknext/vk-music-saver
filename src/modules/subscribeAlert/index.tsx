import initReactApp from 'src/react/initReactApp';
import { getVMSConfig } from 'src/services/getVMSConfig';
import GlobalStorage from 'src/storages/GlobalStorage';

let isShown = false;
const showModal = async () => {
	if (isShown) return;
	isShown = true;

	const { SubscribeAlert } = await import('./SubscribeAlert');
	const appRoot = document.createElement('div');

	document.body.appendChild(appRoot);

	const { unmount } = await initReactApp({
		root: appRoot,
		content: (
			<SubscribeAlert
				onDestroy={() => {
					unmount();
					appRoot.remove();
				}}
				onButtonClick={() => GlobalStorage.setValue('subscribe_alert_shown', true)}
			/>
		),
		disableParentTransformForPositionFixedElements: true,
		disableAnchorTextDecoration: true,
	});
};

const init = async () => {
	if (await GlobalStorage.getValue('subscribe_alert_shown', false)) return;

	const config = await getVMSConfig();

	if (config.alerts.subscribe) {
		await showModal();
	}
};

init().catch(console.error);
