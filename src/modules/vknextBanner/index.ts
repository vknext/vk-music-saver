// TODO: переписать на свои стили

import onAddAudioPagePlayerWrap from 'src/interactions/onAddAudioPagePlayerWrap';
import delay from 'src/lib/delay';
import waitRAF from 'src/lib/waitRAF';

const createSeparator = () => {
	const catalogBlock = document.createElement('div');
	catalogBlock.className = 'CatalogBlock CatalogBlock--separator';

	const catalogContent = document.createElement('div');
	catalogContent.className =
		'CatalogBlock__content CatalogBlock__audio_friends_separator CatalogBlock__layout--in_block_separator';
	catalogBlock.appendChild(catalogContent);

	return catalogBlock;
};

const createBanner = () => {
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
	audioTitle.textContent = 'VK Next';
	audioPlaceholder.appendChild(audioTitle);

	const audioText = document.createElement('div');
	audioText.className = 'AudioPlaceholder__text';
	audioText.textContent =
		'Расширение с красивым дизайном в стиле VK, дополняющее ВКонтакте уникальными и эксклюзивными функциями';
	audioPlaceholder.appendChild(audioText);

	const audioActions = document.createElement('div');
	audioActions.className = 'AudioPlaceholder__actions';
	audioPlaceholder.appendChild(audioActions);

	const subscribeLink = document.createElement('a');
	subscribeLink.className = 'FlatButton FlatButton--secondary FlatButton--size-m FlatButton--wide';
	subscribeLink.draggable = false;
	subscribeLink.href = 'https://vknext.net?utm_source=vms';
	subscribeLink.target = '_blank';
	audioActions.appendChild(subscribeLink);

	const flatButtonIn = document.createElement('span');
	flatButtonIn.className = 'FlatButton__in';
	subscribeLink.appendChild(flatButtonIn);

	const flatButtonContent = document.createElement('span');
	flatButtonContent.className = 'FlatButton__content';
	flatButtonContent.textContent = 'Установить';
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

	column.append(createSeparator(), createBanner());
};

const initVKNextBanner = () => {
	onAddAudioPagePlayerWrap(onOpenAudioPage);
};

export default initVKNextBanner;
