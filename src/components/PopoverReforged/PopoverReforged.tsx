import type { PopoverProps } from '@vkontakte/vkui';
import { Popover, classNames } from '@vkontakte/vkui';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import styles from './PopoverReforged.module.scss';

export interface PopoverReforgedProps extends PopoverProps {
	hideOnClick?: boolean;
	noBackground?: boolean;
	/**
	 * `side` - если подразумевается использование `PopoverReforged` в `content` и нужно чтобы при нажатии на контент всплывающее окно не закрывалось
	 */
	mode?: 'side';
	contentWrapperClassName?: string;
	content?: React.ReactNode;
}

/**
 * @version 14.0 (vknext)
 */
const PopoverReforged = ({
	hideOnClick = false,
	noBackground = false,
	mode,

	onClick,
	onShownChange,
	className,
	contentWrapperClassName,
	shown: popoverShown,
	content,
	...props
}: PopoverReforgedProps) => {
	const [isShown, setIsShown] = useState(false);

	const sideHideRef = useRef<NodeJS.Timeout | null>(null);

	const nodeRef = useRef<HTMLDivElement>(null);

	const shownChange = useCallback(
		(isShown: boolean) => {
			if (isShown) {
				setIsShown(true);
			} else {
				sideHideRef.current = setTimeout(() => {
					setIsShown(false);
				}, 100);
			}

			onShownChange?.(isShown);
		},
		[mode, onShownChange, setIsShown]
	);

	useEffect(() => {
		if (typeof popoverShown == 'boolean') {
			shownChange(popoverShown);
		}
	}, [popoverShown, shownChange]);

	return (
		<Popover
			shown={isShown}
			className={classNames(
				styles.PopoverReforged,
				noBackground && styles['PopoverReforged--noBackground'],
				className
			)}
			onShownChange={shownChange}
			onClick={(event) => {
				if (mode === 'side' && sideHideRef.current) {
					clearTimeout(sideHideRef.current);
					return;
				}

				try {
					onClick?.(event);
				} catch (e) {
					console.error(e);
				}
			}}
			content={
				<div
					ref={nodeRef}
					className={classNames(contentWrapperClassName)}
					onClick={(event) => {
						if (hideOnClick && nodeRef.current?.contains(event.target as Node)) {
							setIsShown(false);
						}
					}}
				>
					{content}
				</div>
			}
			{...props}
		/>
	);
};

export default PopoverReforged;
