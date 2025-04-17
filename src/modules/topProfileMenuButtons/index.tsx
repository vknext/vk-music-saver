import waitVariable from '@vknext/shared/vkcom/globalVars/utils/waitVariable';
import initReactApp from 'src/react/initReactApp';
import getTopMenu from './getTopMenu';

const wrapper = document.createElement('div');

const initApp = async () => {
	const topMenu = await getTopMenu();
	if (!topMenu) {
		return;
	}

	if (topMenu.contains(wrapper)) {
		return;
	}

	const child = topMenu.querySelector('[href*="act=payments"]');

	if (child?.parentElement) {
		child.parentElement.insertBefore(wrapper, child);
	} else {
		topMenu.appendChild(wrapper);
	}

	const EcoPlateButtons = await import('./EcoPlateButtons');

	await initReactApp({
		root: wrapper,
		content: <EcoPlateButtons.default />,
		disableParentTransformForPositionFixedElements: true,
		disableAppRoot: true,
		noStyling: true,
	});
};

const initTopMenuButtons = async () => {
	const TopMenu = await waitVariable('TopMenu');

	if (document.querySelector('#top_profile_menu.shown')) {
		initApp().catch(console.error);
	}

	const toggle = TopMenu.toggle;

	TopMenu.toggle = function (...args) {
		initApp().catch(console.error);

		return Reflect.apply(toggle, this, args);
	};
};

initTopMenuButtons().catch(console.error);
