import showReactModal from 'src/react/showReactModal';

const showSettingsModal = async () => {
	const { default: Modal } = await import('./SettingsModal');

	showReactModal(<Modal />, { zIndex: 1005 });
};

export default showSettingsModal;
