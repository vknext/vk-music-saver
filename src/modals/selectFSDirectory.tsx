import createPromise from 'src/lib/createPromise';
import showReactModal from 'src/react/showReactModal';

interface selectFSDirectoryProps {
	onShowPicker: () => Promise<FileSystemDirectoryHandle>;
}

const selectFSDirectory = async ({ onShowPicker }: selectFSDirectoryProps) => {
	const { default: Modal } = await import('./SelectFCDirectoryModal');

	const { promise, resolve } = createPromise<[directory: FileSystemDirectoryHandle | null, isNumTracks: boolean]>();

	showReactModal(<Modal onSelect={resolve} onShowPicker={onShowPicker} />, {
		zIndex: 612,
	});

	return await promise;
};

export default selectFSDirectory;
