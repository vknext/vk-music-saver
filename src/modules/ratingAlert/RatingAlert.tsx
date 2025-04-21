import { Alert } from '@vkontakte/vkui';
import { CHROME_REVIEW_URL, FIREFOX_REVIEW_URL, IS_FIREFOX } from 'src/common/constants';
import useLang from 'src/hooks/useLang';
import styles from './RatingAlert.module.scss';

interface RatingAlertProps {
	onDestroy: () => void;
	onButtonClick: () => void;
}

export const RatingAlert = ({ onDestroy, onButtonClick }: RatingAlertProps) => {
	const lang = useLang();

	return (
		<Alert
			className={styles.RatingAlert}
			onClose={onDestroy}
			title={lang.use('vms_rating_title')}
			description={lang.use('vms_rating_desc', {
				storeName: IS_FIREFOX ? 'Firefox Add-ons' : 'Chrome Web Store',
			})}
			actionsLayout="vertical"
			actions={[
				{
					title: lang.use('vms_rating_yes'),
					mode: 'cancel',
					href: IS_FIREFOX ? FIREFOX_REVIEW_URL : CHROME_REVIEW_URL,
					target: '_blank',
					action: onButtonClick,
				},
				{
					title: lang.use('vms_rating_no'),
					mode: 'default',
					action: onButtonClick,
				},
			]}
		/>
	);
};
