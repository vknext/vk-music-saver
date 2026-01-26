import { IS_DIRECTORY_PICKER_SUPPORTED, IS_SAVE_FILE_PICKER_SUPPORTED } from 'src/common/constants';
import selectFSDirectory from 'src/modals/selectFSDirectory';
import { DownloadFilesMethod } from 'src/storages/enums';
import GlobalStorage from 'src/storages/GlobalStorage';

interface getFSDirectoryHandleProps {
	id: string;
	startIn: WellKnownDirectory;
	suggestedFileName: string;
	fileTypes?: FilePickerAcceptType[];
}

const getFSDirectoryHandle = async ({
	id,
	startIn,
	suggestedFileName,
	fileTypes,
}: getFSDirectoryHandleProps): Promise<FileSystemDirectoryHandle | FileSystemFileHandle | null> => {
	const onShowDirectoryPicker = () => window.showDirectoryPicker({ id, startIn, mode: 'readwrite' });
	const onShowSaveFilePicker = () =>
		window.showSaveFilePicker({ id, startIn, suggestedName: suggestedFileName, types: fileTypes });

	const method = await GlobalStorage.getValue('download_files_method', DownloadFilesMethod.UNSELECTED);

	if (method === DownloadFilesMethod.DIRECTORY && IS_DIRECTORY_PICKER_SUPPORTED) {
		return await onShowDirectoryPicker();
	}

	if (method === DownloadFilesMethod.ZIP && IS_SAVE_FILE_PICKER_SUPPORTED) {
		return await onShowSaveFilePicker();
	}

	if (method === DownloadFilesMethod.UNSELECTED && IS_DIRECTORY_PICKER_SUPPORTED && IS_SAVE_FILE_PICKER_SUPPORTED) {
		return await selectFSDirectory({ onShowDirectoryPicker, onShowSaveFilePicker });
	}

	return null;
};

export default getFSDirectoryHandle;
