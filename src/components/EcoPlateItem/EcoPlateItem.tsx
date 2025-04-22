import type { LinkProps } from '@vkontakte/vkui';
import { classNames, Counter, Link, SimpleCell, Text } from '@vkontakte/vkui';
import styles from './EcoPlateItem.module.scss';

interface MenuItemProps {
	id?: string;
	asideText?: React.ReactNode;
	counter?: React.ReactNode;
	icon: React.ReactNode;
	href?: string;
	onClick?: React.MouseEventHandler<HTMLElement>;
	asideLink?: LinkProps;
	children: React.ReactNode;
	target?: '_blank' | '_self';
}

/**
 * @version 14.0 (vknext)
 */
const EcoPlateItem = ({ asideText, counter, icon, id, href, onClick, asideLink, children, target }: MenuItemProps) => {
	const aside = asideText || (
		<Counter size="s" mode="primary" appearance="accent">
			{counter}
		</Counter>
	);
	const iconElement = <span className={styles.EcoPlateItem__icon}>{icon}</span>;

	return (
		<SimpleCell
			id={id}
			className={classNames(styles.EcoPlateItem, 'vknextInternalEcoPlateItem')}
			href={href}
			onClick={onClick}
			before={iconElement}
			indicator={aside}
			after={asideLink && <Link {...asideLink} />}
			target={target}
			multiline
		>
			<Text className={styles.EcoPlateItem__text}>{children}</Text>
		</SimpleCell>
	);
};

export default EcoPlateItem;
