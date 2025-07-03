import showReactModal from 'src/react/showReactModal';

const showSettingsModal = async () => {
	const { default: Modal } = await import('./SettingsModal');

	showReactModal(<Modal />, { zIndex: 1100 });
};

export default showSettingsModal;
