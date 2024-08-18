import delay from 'src/lib/delay';

const getAudioPlayerUserControlsContainer = async (root: HTMLElement, retryCount = 0): Promise<HTMLElement> => {
	if (retryCount === 5) {
		throw new Error('[VMS/audio hooks] users controls not found');
	}

	const container = root.querySelector<HTMLElement>(
		'[class^="AudioPlayerUserControlsContainer-module__userButtonsContainer--"]'
	);

	if (!container) {
		await delay(1000);
		return getAudioPlayerUserControlsContainer(root, retryCount + 1);
	}

	return container;
};

export default getAudioPlayerUserControlsContainer;
