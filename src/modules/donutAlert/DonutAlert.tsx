import { Alert } from '@vkontakte/vkui';
import { VKNEXT_DONUT_URL } from 'src/common/constants';
import useLang from 'src/hooks/useLang';
// import styles from './DonutAlert.module.scss';

interface DonutAlertProps {
	onDestroy: () => void;
	onButtonClick: () => void;
}

export const DonutAlert = ({ onDestroy, onButtonClick }: DonutAlertProps) => {
	const lang = useLang();

	return (
		<Alert
			// className={styles.DonutAlert}
			onClose={onDestroy}
			title={lang.use('vms_alert_donate_title')}
			description={lang.use('vms_alert_donate_desc')}
			actionsLayout="vertical"
			actions={[
				{
					title: lang.use('vms_alert_donate_yes'),
					mode: 'cancel',
					href: VKNEXT_DONUT_URL,
					target: '_blank',
					action: onButtonClick,
				},
				{
					title: lang.use('vms_alert_base_no'),
					mode: 'default',
					action: onButtonClick,
				},
			]}
		/>
	);
};
