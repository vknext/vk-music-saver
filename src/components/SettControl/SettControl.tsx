import { SimpleCell, Skeleton } from '@vkontakte/vkui';
import useStorageValue from 'src/hooks/useStorageValue';
import type { GlobalStorageBooleanKeys, GlobalStorageBooleanValues } from 'src/storages/types';
import AndroidSwitch from 'src/components/AndroidSwitch/AndroidSwitch';
import styles from './SettControl.module.scss';
import showSnackbar from 'src/react/showSnackbar';
import useLang from 'src/hooks/useLang';

interface SettControlProps<Key extends GlobalStorageBooleanKeys> {
	option: Key;
	defaultValue: GlobalStorageBooleanValues[Key];
	disabled?: boolean;
	children: React.ReactNode;
	subtitle?: React.ReactNode;
	needReloadPage?: boolean;
}

const SettControl = <Key extends GlobalStorageBooleanKeys>({
	option,
	defaultValue,
	children,
	subtitle,
	disabled,
	needReloadPage,
}: SettControlProps<Key>) => {
	const lang = useLang();
	const { value, setValue, isLoading } = useStorageValue(option, defaultValue);

	const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
		setValue(e.target.checked);

		if (needReloadPage) {
			showSnackbar({
				type: 'warning',
				text: 'VK Music Saver',
				subtitle: lang.use('vms_settings_need_reload_page'),
			});
		}
	};

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
					<AndroidSwitch disabled={disabled} checked={value} onChange={onChange} />
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
