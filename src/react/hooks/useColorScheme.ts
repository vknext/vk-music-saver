import { useEffect, useState } from 'react';
import waitColorScheme from 'src/globalVars/waitColorScheme';
import waitRAF from 'src/lib/waitRAF';
import waitRIC from 'src/lib/waitRIC';
import useAsyncEffect from 'use-async-effect';

const getColorScheme = () => {
	const curMode = window.colorScheme?.currentMode;

	if (curMode === 'auto') {
		return window.colorScheme.currentIsDark ? 'dark' : 'light';
	}

	return curMode;
};

const useColorScheme = () => {
	const [appearance, setAppearance] = useState(() => getColorScheme());
	const [isSubscribed, setIsSubscribed] = useState(!!window.colorScheme?.subscribe);

	useAsyncEffect(async (isMounted) => {
		await waitColorScheme();

		if (!isMounted()) {
			return;
		}

		setIsSubscribed(true);
	}, []);

	useEffect(() => {
		if (!window.colorScheme?.subscribe) {
			setIsSubscribed(false);
			return;
		}

		return window.colorScheme.subscribe(async () => {
			await waitRIC();
			await waitRAF();
			setAppearance(getColorScheme());
		});
	}, [isSubscribed]);

	return appearance;
};

export default useColorScheme;
