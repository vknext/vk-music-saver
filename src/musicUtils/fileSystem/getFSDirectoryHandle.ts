import selectFSDirectory from 'src/modals/selectFSDirectory';

interface getFSDirectoryHandleProps {
	id: string;
	startIn: WellKnownDirectory;
}

const getFSDirectoryHandle = async ({
	id,
	startIn,
}: getFSDirectoryHandleProps): Promise<FileSystemDirectoryHandle | null> => {
	if ('showDirectoryPicker' in window) {
		return await selectFSDirectory({
			onShowPicker: () => window.showDirectoryPicker({ id, startIn, mode: 'readwrite' }),
		});
	}

	return null;
};

export default getFSDirectoryHandle;
