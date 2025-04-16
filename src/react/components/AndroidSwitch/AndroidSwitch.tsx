import { classNames, Platform, PlatformProvider, Switch, type SwitchProps } from '@vkontakte/vkui';
import styles from './AndroidSwitch.module.scss';

/**
 * @see https://vkcom.github.io/VKUI/#/Switch
 */
const AndroidSwitch = ({ className, ...props }: SwitchProps) => {
	return (
		<PlatformProvider value={Platform.ANDROID}>
			<Switch className={classNames(styles.Switch, className)} {...props} />
		</PlatformProvider>
	);
};

export default AndroidSwitch;
