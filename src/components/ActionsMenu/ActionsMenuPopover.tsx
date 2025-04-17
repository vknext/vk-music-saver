import { classNames } from '@vkontakte/vkui';
import type { PopoverReforgedProps } from '../PopoverReforged/PopoverReforged';
import PopoverReforged from '../PopoverReforged/PopoverReforged';
import { ActionsMenu } from './ActionsMenu/ActionsMenu';

export interface ActionsMenuPopoverProps extends Omit<PopoverReforgedProps, 'content' | 'noBackground'> {
	/**
	 * Целевой элемент. Всплывающее окно появится возле него.
	 *
	 * > ⚠️ Если это пользовательский компонент, то он должен предоставлять параметры либо `getRootRef`, либо `ref` для получения ссылки на DOM-узел.
	 */
	children: React.ReactElement;
	actions: React.ReactNode;
	hideOnClick?: boolean;
	actionsMenuClassName?: string;
	/**
	 * Отключает всплывающее окно. Рендерится только `children`.
	 */
	disabled?: boolean;
	useScrollView?: boolean;
}
/**
 *
 * @version 14.0 (vknext)
 */
export const ActionsMenuPopover = ({
	children,
	actions,
	actionsMenuClassName,

	hideOnClick = true,
	disabled = false,
	useScrollView = false,

	...restProps
}: ActionsMenuPopoverProps) => {
	if (disabled) {
		return children;
	}

	return (
		<PopoverReforged
			content={
				<ActionsMenu useScrollView={useScrollView} className={classNames(actionsMenuClassName)}>
					{actions}
				</ActionsMenu>
			}
			noBackground
			hideOnClick={hideOnClick}
			{...restProps}
		>
			{children}
		</PopoverReforged>
	);
};
