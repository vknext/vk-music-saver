import { Icon20CheckCircleFillGreen, Icon20ErrorCircleFillRed, Icon20ErrorCircleFillYellow } from '@vkontakte/icons';
import { classNames, Snackbar, type SnackbarProps } from '@vkontakte/vkui';
import styles from './index.module.scss';

export interface BaseSnackbarProps
	extends Pick<SnackbarProps, 'before' | 'subtitle' | 'onActionClick' | 'duration' | 'action' | 'onClose'> {
	text: React.ReactNode;
	type?: 'done' | 'error' | 'warning';
}

const BeforeSnackbar = ({ type }: Pick<BaseSnackbarProps, 'type'>) => {
	if (type === 'done') {
		return <Icon20CheckCircleFillGreen width={28} height={28} />;
	}

	if (type === 'error') {
		return <Icon20ErrorCircleFillRed width={28} height={28} />;
	}

	if (type === 'warning') {
		return <Icon20ErrorCircleFillYellow width={28} height={28} />;
	}

	return null;
};

const BaseSnackbar = ({ text, type, before, ...props }: BaseSnackbarProps) => {
	return (
		<Snackbar
			className={classNames(styles.BaseSnackbar)}
			before={before ? before : <BeforeSnackbar type={type} />}
			{...props}
		>
			{text}
		</Snackbar>
	);
};

export default BaseSnackbar;
