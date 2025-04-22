import type { ClientZipFile } from 'src/types';

interface createFileInDirectoryProps {
	dirHandle: FileSystemDirectoryHandle;
	zipFile: ClientZipFile;
	subFolderName?: string;
}

const createFileInDirectory = async ({ dirHandle, zipFile, subFolderName }: createFileInDirectoryProps) => {
	try {
		const { name, input } = zipFile;

		const subDirHandle = subFolderName
			? await dirHandle.getDirectoryHandle(subFolderName, { create: true })
			: dirHandle;

		const fileHandle = await subDirHandle.getFileHandle(name, { create: true });

		const writableStream = await fileHandle.createWritable();

		await writableStream.write(input);
		await writableStream.close();
	} catch (e) {
		console.error(e);
	}
};

export default createFileInDirectory;
