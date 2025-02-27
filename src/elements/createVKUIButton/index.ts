import styles from './index.module.scss';

interface CreateVKUIButtonProps {
	mode?: 'primary' | 'secondary' | 'tertiary' | 'outline' | 'link';
	appearance?: 'accent' | 'positive' | 'negative' | 'neutral' | 'overlay' | 'accent-invariable';
	size?: 's' | 'm' | 'l';
}

// TODO: переписать на свои классы или на реакт
const createVKUIButton = ({ mode = 'primary', appearance = 'accent', size = 's' }: CreateVKUIButtonProps = {}) => {
	let isLoading = false;

	const button = document.createElement('button');
	button.className = `vkuiButton vkuiButton--align-center vkuiButton--appearance-${appearance} vkuiButton--mode-${mode} vkuiButton--size-${size} vkuiClickable__host vkuiClickable__realClickable vkuiClickable__resetButtonStyle vkuiRootComponent vkuiTappable vkuiTappable--hasPointer-none`;
	button.type = 'button';
	button.setAttribute('aria-expanded', 'false');

	button.classList.add(styles.vkuiButton);

	const spanIn = document.createElement('span');
	spanIn.className = 'vkuiButton__in';

	const spanContent = document.createElement('span');
	spanContent.className = 'vkuiButton__content';

	spanIn.appendChild(spanContent);
	button.appendChild(spanIn);

	return {
		element: button,
		setIsLoading: (_isLoading: boolean) => {
			isLoading = _isLoading;

			if (_isLoading) {
				button.setAttribute('disabled', '');
			} else {
				button.removeAttribute('disabled');
			}
		},
		getIsLoading: () => isLoading,
		setText: (text: string) => {
			spanContent.innerText = text;
		},
	};
};

export default createVKUIButton;
