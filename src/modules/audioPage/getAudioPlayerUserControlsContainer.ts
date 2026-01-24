import { delay } from '@vknext/shared/utils/delay';

const getAudioPlayerUserControlsContainer = async (root: HTMLElement, retryCount = 0): Promise<HTMLElement> => {
	if (retryCount === 5) {
		throw new Error('[VK Music Saver/audio hooks] users controls not found');
	}

	const container = root.querySelector<HTMLElement>(
		'[class*="AudioPlayerUserControlsContainer__userButtonsContainer--"]'
	);

	if (!container) {
		await delay(1000);
		return getAudioPlayerUserControlsContainer(root, retryCount + 1);
	}

	return container;
};

export default getAudioPlayerUserControlsContainer;
