import type { ClientZipFile } from 'src/types';

interface CreateFileInDirectoryOptions {
	dirHandle: FileSystemDirectoryHandle;
	zipFile: ClientZipFile;
	subFolderName?: string;
	signal?: AbortSignal;
}

const getTargetDirectory = async (
	dirHandle: FileSystemDirectoryHandle,
	subFolderName?: string
): Promise<FileSystemDirectoryHandle> => {
	if (!subFolderName) {
		return dirHandle;
	}

	try {
		return await dirHandle.getDirectoryHandle(subFolderName, { create: true });
	} catch (error) {
		console.error(`[VK Music Saver] Failed to create/access subdirectory "${subFolderName}":`, error);
	}

	return dirHandle;
};

const writeFileToDirectory = async (
	dirHandle: FileSystemDirectoryHandle,
	zipFile: ClientZipFile,
	signal?: AbortSignal
): Promise<void> => {
	const { name, input } = zipFile;

	try {
		const fileHandle = await dirHandle.getFileHandle(name, { create: true });
		const writableStream = await fileHandle.createWritable();

		if (input instanceof ReadableStream) {
			await input.pipeTo(writableStream, { signal });
		} else {
			try {
				await writableStream.write(input);
			} finally {
				await writableStream.close();
			}
		}
	} catch (error) {
		console.error(`[VK Music Saver] Failed to write file "${name}":`, error);
		throw error;
	}
};

const createFileInDirectory = async ({
	dirHandle,
	zipFile,
	subFolderName,
	signal,
}: CreateFileInDirectoryOptions): Promise<void> => {
	const targetDirectory = await getTargetDirectory(dirHandle, subFolderName);

	await writeFileToDirectory(targetDirectory, zipFile, signal);
};

export default createFileInDirectory;
