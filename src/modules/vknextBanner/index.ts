// TODO: переписать на свои стили

import { delay } from '@vknext/shared/utils/delay';
import { waitRAF } from '@vknext/shared/utils/waitRAF';
import onAddAudioPagePlayerWrap from 'src/interactions/onAddAudioPagePlayerWrap';

const createSeparator = () => {
	const catalogBlock = document.createElement('div');
	catalogBlock.className = 'CatalogBlock CatalogBlock--separator';

	const catalogContent = document.createElement('div');
	catalogContent.className =
		'CatalogBlock__content CatalogBlock__audio_friends_separator CatalogBlock__layout--in_block_separator';
	catalogBlock.appendChild(catalogContent);

	return catalogBlock;
};

interface createBannerProps {
	title: string;
	description?: string;
	href: string;
	buttonText: string;
}

const createBanner = ({ title, description, href, buttonText }: createBannerProps) => {
	const catalogBlock = document.createElement('div');
	catalogBlock.className = 'CatalogBlock';

	const catalogContent = document.createElement('div');
	catalogContent.className = 'CatalogBlock__content CatalogBlock__subscription CatalogBlock__layout--placeholder';
	catalogBlock.appendChild(catalogContent);

	const itemsContainer = document.createElement('div');
	itemsContainer.className = 'CatalogBlock__itemsContainer';
	catalogContent.appendChild(itemsContainer);

	const audioPlaceholder = document.createElement('div');
	audioPlaceholder.className = 'AudioPlaceholder AudioPlaceholder--small';
	itemsContainer.appendChild(audioPlaceholder);

	const audioTitle = document.createElement('div');
	audioTitle.className = 'AudioPlaceholder__title';
	audioTitle.textContent = title;
	audioPlaceholder.appendChild(audioTitle);

	const audioText = document.createElement('div');
	audioText.className = 'AudioPlaceholder__text';
	audioText.textContent = description || '';
	audioPlaceholder.appendChild(audioText);

	const audioActions = document.createElement('div');
	audioActions.className = 'AudioPlaceholder__actions';
	audioPlaceholder.appendChild(audioActions);

	const subscribeLink = document.createElement('a');
	subscribeLink.className = 'FlatButton FlatButton--secondary FlatButton--size-m FlatButton--wide';
	subscribeLink.draggable = false;
	subscribeLink.href = href;
	subscribeLink.target = '_blank';
	audioActions.appendChild(subscribeLink);

	const flatButtonIn = document.createElement('span');
	flatButtonIn.className = 'FlatButton__in';
	subscribeLink.appendChild(flatButtonIn);

	const flatButtonContent = document.createElement('span');
	flatButtonContent.className = 'FlatButton__content';
	flatButtonContent.textContent = buttonText;
	flatButtonIn.appendChild(flatButtonContent);

	return catalogBlock;
};

const onOpenAudioPage = async () => {
	await delay(1000);
	await waitRAF();

	const column = document.querySelector<HTMLElement>('.CatalogSection__stickyColumn');
	if (!column) return;

	if (column.dataset.vknextBanner === '1') return;
	column.dataset.vknextBanner = '1';

	column.append(
		createSeparator(),
		createBanner({
			title: 'VK Next',
			description:
				'Расширение с красивым дизайном в стиле VK, дополняющее ВКонтакте уникальными и эксклюзивными функциями',
			href: 'https://vknext.net?utm_source=vms',
			buttonText: 'Установить',
		})
	);
};

const initVKNextBanner = () => {
	onAddAudioPagePlayerWrap(onOpenAudioPage);
};

export default initVKNextBanner;
