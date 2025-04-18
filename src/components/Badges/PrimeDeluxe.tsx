import { Icon20CrownCircleFillVkNext } from '@vknext/icons';
import type { TooltipProps } from '@vkontakte/vkui';
import { Tooltip, classNames } from '@vkontakte/vkui';
import useLang from 'src/hooks/useLang';
import styles from './Badges.module.scss';

interface PrimeDeluxeProps extends TooltipProps {
	className?: string;
}

const PrimeDeluxe = ({ className, ...rest }: PrimeDeluxeProps) => {
	const lang = useLang();

	return (
		<Tooltip
			className={styles.Tooltip}
			description={lang.use('vms_badges_deluxe_function_warning')}
			appearance="accent"
			usePortal={document.body}
			{...rest}
		>
			<span className={classNames(styles.Badge, className)}>
				<Icon20CrownCircleFillVkNext height={16} width={16} />
			</span>
		</Tooltip>
	);
};

export default PrimeDeluxe;
