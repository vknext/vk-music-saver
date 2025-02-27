import type { ClientZipFile } from '../../types';

interface createFileInDirectoryProps {
	dirHandle: FileSystemDirectoryHandle;
	zipFilePromise: Promise<ClientZipFile | null>;
	subFolderName?: string;
}

const createFileInDirectory = async ({ dirHandle, zipFilePromise, subFolderName }: createFileInDirectoryProps) => {
	const zipFile = await zipFilePromise;
	if (!zipFile) return;

	const { name, input } = zipFile;

	const subDirHandle = subFolderName
		? await dirHandle.getDirectoryHandle(subFolderName, { create: true })
		: dirHandle;

	const fileHandle = await subDirHandle.getFileHandle(name, { create: true });

	const writableStream = await fileHandle.createWritable();

	await writableStream.write(input);
	await writableStream.close();
};

export default createFileInDirectory;
