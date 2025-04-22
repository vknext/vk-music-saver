import type { CustomModalPageEvents } from '@vknext/shared/components/CustomModalPage/CustomModalPage';

export type ReactModalProps = CustomModalPageEvents;

export type ReactModalComponent = React.FC<ReactModalProps> | React.JSX.Element;

export interface ShowReactModalOptions {
	zIndex?: number;
}

export type ShowReactModalFunc = (component: ReactModalComponent, options?: ShowReactModalOptions) => void;
