import initReactApp from 'src/react/initReactApp';
import { getVMSConfig } from 'src/services/getVMSConfig';
import GlobalStorage from 'src/storages/GlobalStorage';

let isShown = false;
const showModal = async () => {
	if (isShown) return;
	isShown = true;

	const { default: VMPOnboarding } = await import('./VMPOnboarding/VMPOnboarding');
	const appRoot = document.createElement('div');

	document.body.appendChild(appRoot);

	const { unmount } = await initReactApp({
		root: appRoot,
		content: (
			<VMPOnboarding
				onClosed={() => {
					unmount();
					appRoot.remove();

					GlobalStorage.setValue('vmp_onboarding_shown', true);
				}}
			/>
		),
		disableParentTransformForPositionFixedElements: true,
		disableAnchorTextDecoration: true,
	});
};

const init = async () => {
	if (await GlobalStorage.getValue('vmp_onboarding_shown', false)) return;

	const config = await getVMSConfig();

	if (config.alerts.vmp) {
		await showModal();
	}
};

init().catch(console.error);
