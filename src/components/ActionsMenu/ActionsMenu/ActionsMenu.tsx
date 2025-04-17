import { CustomScrollView, classNames } from '@vkontakte/vkui';
import styles from './ActionsMenu.module.scss';

interface ActionsMenuProps extends React.HTMLAttributes<HTMLDivElement> {
	className?: string;
	children?: React.ReactNode;
	getRootRef?: React.Ref<HTMLDivElement>;
	useScrollView?: boolean;
}

/**
 *
 * @version 14.0 (vknext)
 */
export const ActionsMenu = ({ className, children, getRootRef, useScrollView, ...restProps }: ActionsMenuProps) => {
	if (useScrollView) {
		return (
			<CustomScrollView getRootRef={getRootRef} className={classNames(styles.ActionsMenu, className)}>
				{children}
			</CustomScrollView>
		);
	}

	return (
		<div ref={getRootRef} {...restProps} className={classNames(styles.ActionsMenu, className)}>
			{children}
		</div>
	);
};
