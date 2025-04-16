import { SelectionControl } from '@vkontakte/vkui';
import useStorageValue from 'src/react/hooks/useStorageValue';
import type { GlobalStorageBooleanKeys, GlobalStorageBooleanValues } from 'src/storages/types';
import AndroidSwitch from '../AndroidSwitch/AndroidSwitch';

interface SettControlProps<Key extends GlobalStorageBooleanKeys> {
	option: Key;
	defaultValue: GlobalStorageBooleanValues[Key];
	disabled?: boolean;
	label: React.ReactNode;
	description?: React.ReactNode;
}

const SettControl = <Key extends GlobalStorageBooleanKeys>({
	option,
	defaultValue,
	label,
	description,
	disabled,
}: SettControlProps<Key>) => {
	const { value, setValue, isLoading } = useStorageValue(option, defaultValue);

	return (
		<SelectionControl disabled={isLoading || disabled}>
			<SelectionControl.Label description={description}>{label}</SelectionControl.Label>
			<AndroidSwitch
				disabled={isLoading || disabled}
				checked={value}
				onChange={(e) => setValue(e.target.checked)}
			/>
		</SelectionControl>
	);
};

export default SettControl;
