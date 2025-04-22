import { useEffect, useState } from 'react';
import GlobalStorage from 'src/storages/GlobalStorage';
import type { GlobalStorageBaseKeys, GlobalStorageBaseValues } from 'src/storages/types';

type ReturnValue<Key extends GlobalStorageBaseKeys> = {
	value: GlobalStorageBaseValues[Key];
	setValue: (newValue: GlobalStorageBaseValues[Key]) => void;
	isLoading: boolean;
};

function useStorageValue<Key extends GlobalStorageBaseKeys>(
	key: Key,
	defaultValue: GlobalStorageBaseValues[Key]
): ReturnValue<Key> {
	const [value, _setValue] = useState<GlobalStorageBaseValues[Key]>(defaultValue);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let isMounted = true;

		GlobalStorage.getValue(key, defaultValue)
			.then((value) => {
				if (isMounted) {
					_setValue(value);
					setIsLoading(false);
				}
			})
			.catch(console.error);

		const unsubscribe = GlobalStorage.addListener(key, (props) => _setValue(props.newValue));

		return () => {
			isMounted = false;

			unsubscribe();
		};
	}, []);

	const setValue = (newValue: GlobalStorageBaseValues[Key]) => {
		_setValue(newValue);

		GlobalStorage.setValue(key, newValue).catch(console.error);
	};

	return { value, setValue, isLoading };
}

export default useStorageValue;
