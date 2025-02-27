import type { ModalPageProps } from '@vkontakte/vkui';
import { ModalPage, PanelSpinner } from '@vkontakte/vkui';
import { Suspense, useId } from 'react';
import { useCustomModalEvents } from './CustomModalPageContext';

interface CustomModalPageProps
	extends Omit<ModalPageProps, 'nav' | 'id' | 'onClose' | 'onClosed' | 'onOpen' | 'onOpened'> {
	style?: React.CSSProperties & { [key: string]: string };
	noClose?: boolean;
}

export type CustomModalPageEvents = Pick<ModalPageProps, 'onClose' | 'onClosed' | 'onOpen' | 'onOpened'>;

const CustomModalPage = ({ children, noClose = false, ...props }: CustomModalPageProps) => {
	const { open, setOpen, onClose, onClosed, onOpen, onOpened } = useCustomModalEvents();

	const id = useId();

	return (
		<ModalPage
			nav={id}
			open={open}
			onClose={(reason, event) => {
				if (noClose) return;

				setOpen(false);

				onClose?.(reason, event);
			}}
			onClosed={onClosed}
			onOpen={onOpen}
			onOpened={onOpened}
			{...props}
		>
			<Suspense fallback={<PanelSpinner />}>{children}</Suspense>
		</ModalPage>
	);
};

export default CustomModalPage;
