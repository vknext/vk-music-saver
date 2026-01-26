import { createPromise } from '@vknext/shared/utils/createPromise';
import showReactModal from 'src/react/showReactModal';

interface selectFSDirectoryProps {
	onShowDirectoryPicker: () => Promise<FileSystemDirectoryHandle>;
	onShowSaveFilePicker: () => Promise<FileSystemFileHandle>;
}

const selectFSDirectory = async ({ onShowDirectoryPicker, onShowSaveFilePicker }: selectFSDirectoryProps) => {
	const { default: Modal } = await import('./SelectFCDirectoryModal');

	const { promise, resolve } = createPromise<FileSystemDirectoryHandle | FileSystemFileHandle | null>();

	showReactModal(
		<Modal
			onSelect={resolve}
			onShowDirectoryPicker={onShowDirectoryPicker}
			onShowSaveFilePicker={onShowSaveFilePicker}
		/>,
		{
			zIndex: 1100,
		}
	);

	return await promise;
};

export default selectFSDirectory;
