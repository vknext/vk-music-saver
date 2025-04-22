import { classNames } from '@vkontakte/vkui';
import styles from './ActionsMenuAction.module.scss';

const stylesSize = {
	mini: styles['ActionsMenuAction--size-mini'],
	large: styles['ActionsMenuAction--size-large'],
	regular: styles['ActionsMenuAction--size-regular'],
	max: styles['ActionsMenuAction--size-max'],
};

const stylesType = {
	primary: styles['ActionsMenuAction--primary'],
	secondary: styles['ActionsMenuAction--secondary'],
	danger: styles['ActionsMenuAction--danger'],
	warning: styles['ActionsMenuAction--warning'],
};

export interface ActionsMenuActionProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> {
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
	subtitle?: React.ReactNode;
	type?: keyof typeof stylesType;
	size?: keyof typeof stylesSize;
	isActive?: boolean;
	isLoading?: boolean;
	titleClassName?: string;
	disabled?: boolean;
	className?: string;
	getRootRef?: React.Ref<HTMLAnchorElement>;
	Component?: React.ElementType;
	hasHover?: boolean;
	children: React.ReactNode;
	multiline?: boolean;
}

/**
 *
 * @version 14.0 (vknext)
 */
export const ActionsMenuAction = ({
	leftIcon,
	rightIcon,
	title,
	subtitle,
	type = 'secondary',
	size = 'regular',
	isActive = false,
	hasHover = true,
	isLoading,
	className,
	onClick,
	titleClassName,
	getRootRef,
	href,
	Component = href ? 'a' : 'button',
	children,
	multiline = false,
	...rest
}: ActionsMenuActionProps) => {
	return (
		<Component
			className={classNames(
				styles.ActionsMenuAction,
				hasHover && styles['ActionsMenuAction--hover'],
				(onClick || hasHover || href) && styles['ActionsMenuAction--clickable'],
				stylesType[type],
				isLoading && styles['ActionsMenuAction--loading'],
				isActive && styles['ActionsMenuAction--active'],
				multiline && styles['ActionsMenuAction--multiline'],
				stylesSize[size],
				className
			)}
			onClick={isLoading ? undefined : onClick}
			ref={getRootRef}
			href={href}
			{...rest}
		>
			{leftIcon && <i className={styles.ActionsMenuAction__icon}>{leftIcon}</i>}
			<span title={title} className={classNames(styles.ActionsMenuAction__title, titleClassName)}>
				{children}
				{subtitle && <span className={styles.ActionsMenuAction__subtitle}>{subtitle}</span>}
			</span>
			{rightIcon && <i className={styles.ActionsMenuAction__icon}>{rightIcon}</i>}
		</Component>
	);
};
