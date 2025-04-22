import getIconLogo28LogoMiniVkMusicSaverColor from 'src/icons/getIconLogo28LogoMiniVkMusicSaverColor';
import showSettingsModal from 'src/modals/showSettingsModal';

const init = () => {
	if (window.vk?.id !== 0) return;

	const inner = document.querySelector<HTMLElement>('.side_bar_inner:has(#quick_login)');
	if (!inner) return;

	const item = document.createElement('li');
	item.id = 'l_vms';
	item.className = 'LeftMenu__item';
	item.style.cursor = 'pointer';

	const link = document.createElement('div');
	link.className = 'LeftMenu__itemLink';
	link.addEventListener('click', showSettingsModal);

	const iconWrap = document.createElement('div');
	iconWrap.className = 'LeftMenu__icon';

	const icon = getIconLogo28LogoMiniVkMusicSaverColor();
	icon.setAttribute('width', '20');
	icon.setAttribute('height', '20');

	iconWrap.appendChild(icon);

	const label = document.createElement('span');
	label.className = 'LeftMenu__itemLabel';
	label.innerText = 'VK Music Saver';

	link.appendChild(iconWrap);
	link.appendChild(label);

	item.appendChild(link);

	const sbList = inner.querySelector<HTMLElement>('.side_bar_ol');

	if (sbList) {
		sbList.prepend(item);
	} else {
		inner.appendChild(item);
	}
};

init();
