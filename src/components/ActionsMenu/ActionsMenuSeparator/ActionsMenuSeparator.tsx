import { classNames } from '@vkontakte/vkui';
import styles from './ActionsMenuSeparator.module.scss';

interface ActionsMenuSeparatorProps {
	className?: string;
	getRootRef?: React.Ref<HTMLDivElement>;
}

/**
 *
 * @version 14.0 (vknext)
 */
export const ActionsMenuSeparator = ({ getRootRef, className, ...rest }: ActionsMenuSeparatorProps) => (
	<div
		role="separator"
		className={classNames(styles.ActionsMenuActionSeparator, className)}
		ref={getRootRef}
		{...rest}
	/>
);
