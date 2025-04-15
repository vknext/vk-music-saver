import { Icon24CheckCircleOutline, Icon24ErrorCircleOutline, Icon24WarningTriangleOutline } from '@vkontakte/icons';
import { classNames, Snackbar, type SnackbarProps } from '@vkontakte/vkui';
import styles from './index.module.scss';

export interface BaseSnackbarProps
	extends Pick<SnackbarProps, 'before' | 'subtitle' | 'onActionClick' | 'duration' | 'action' | 'onClose'> {
	text: React.ReactNode;
	type?: 'done' | 'error' | 'warning';
}

const BeforeSnackbar = ({ type }: Pick<BaseSnackbarProps, 'type'>) => {
	if (type === 'done') {
		return <Icon24CheckCircleOutline color="var(--vkui--color_icon_positive)" />;
	}

	if (type === 'error') {
		return <Icon24ErrorCircleOutline color="var(--vkui--color_icon_negative)" />;
	}

	if (type === 'warning') {
		return <Icon24WarningTriangleOutline color="var(--vkui--color_icon_warning)" />;
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
