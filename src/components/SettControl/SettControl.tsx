import { SimpleCell, Skeleton } from '@vkontakte/vkui';
import useStorageValue from 'src/hooks/useStorageValue';
import type { GlobalStorageBooleanKeys, GlobalStorageBooleanValues } from 'src/storages/types';
import AndroidSwitch from 'src/components/AndroidSwitch/AndroidSwitch';
import styles from './SettControl.module.scss';

interface SettControlProps<Key extends GlobalStorageBooleanKeys> {
	option: Key;
	defaultValue: GlobalStorageBooleanValues[Key];
	disabled?: boolean;
	children: React.ReactNode;
	subtitle?: React.ReactNode;
}

const SettControl = <Key extends GlobalStorageBooleanKeys>({
	option,
	defaultValue,
	children,
	subtitle,
	disabled,
}: SettControlProps<Key>) => {
	const { value, setValue, isLoading } = useStorageValue(option, defaultValue);

	return (
		<SimpleCell
			Component="label"
			after={
				isLoading ? (
					<Skeleton
						width={'var(--vkui--size_switch_width--compact)'}
						height={'var(--vkui--size_switch_height--compact)'}
						className={styles.SettControl__skeleton}
					/>
				) : (
					<AndroidSwitch disabled={disabled} checked={value} onChange={(e) => setValue(e.target.checked)} />
				)
			}
			disabled={isLoading || disabled}
			subtitle={subtitle}
			multiline
		>
			{children}
		</SimpleCell>
	);
};

export default SettControl;
