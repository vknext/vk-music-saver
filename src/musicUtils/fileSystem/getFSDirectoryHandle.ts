import { IS_DIRECTORY_PICKER_SUPPORTED } from 'src/common/constants';
import selectFSDirectory from 'src/modals/selectFSDirectory';
import { DownloadFilesMethod } from 'src/storages/enums';
import GlobalStorage from 'src/storages/GlobalStorage';

interface getFSDirectoryHandleProps {
	id: string;
	startIn: WellKnownDirectory;
}

const getFSDirectoryHandle = async ({
	id,
	startIn,
}: getFSDirectoryHandleProps): Promise<FileSystemDirectoryHandle | null> => {
	if (IS_DIRECTORY_PICKER_SUPPORTED) {
		const onShowPicker = () => window.showDirectoryPicker({ id, startIn, mode: 'readwrite' });

		const method = await GlobalStorage.getValue('downloadMethod', DownloadFilesMethod.UNSELECTED);

		if (method === DownloadFilesMethod.DIRECTORY) {
			return await onShowPicker();
		}

		if (method === DownloadFilesMethod.ZIP) {
			return null;
		}

		return await selectFSDirectory({ onShowPicker });
	}

	return null;
};

export default getFSDirectoryHandle;
