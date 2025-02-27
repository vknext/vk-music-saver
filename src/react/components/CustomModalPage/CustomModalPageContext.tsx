import { createContext, useContext, useState } from 'react';
import type { CustomModalPageEvents } from './CustomModalPage';

interface CustomModalPageContextValue extends CustomModalPageEvents {
	open: boolean;
	setOpen: (open: boolean) => void;
}

const ContextModal = createContext<CustomModalPageContextValue | null>(null);

interface CustomModalPageProviderProps extends CustomModalPageEvents {
	children: React.ReactNode;
}

const useContextModal = () => {
	const context = useContext(ContextModal);

	if (!context) {
		throw new Error('CustomModalPageContext has not been passed in provider');
	}

	return context;
};

export const useCustomModalControl = () => {
	const context = useContextModal();

	return {
		closeModal: () => context.setOpen(false),
	};
};

export const useCustomModalEvents = () => {
	const { onClose, onClosed, onOpen, onOpened, open, setOpen } = useContextModal();

	return {
		open,
		setOpen,
		onClose,
		onClosed,
		onOpen,
		onOpened,
	};
};

const CustomModalPageProvider = ({ onClose, onClosed, onOpen, onOpened, ...props }: CustomModalPageProviderProps) => {
	const [open, setOpen] = useState(true);

	return <ContextModal.Provider value={{ open, setOpen, onClose, onClosed, onOpen, onOpened }} {...props} />;
};

export default CustomModalPageProvider;
