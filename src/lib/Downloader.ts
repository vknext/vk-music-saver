import createFileInDirectory from 'src/musicUtils/fileSystem/createFileInDirectory';
import type { ClientZipFile } from 'src/types';
import { ProgressTracker, type OnProgressTrackerCallback } from './ProgressTracker';

interface DownloaderParams {
	signal?: AbortSignal;
	onProgress?: OnProgressTrackerCallback;
}

interface DownloaderSaveOptions {
	/**
	 * без расширения .zip
	 */
	name: string;
	size?: number;
}

export type DownloaderSaveHandle = FileSystemDirectoryHandle | FileSystemFileHandle | null;

export class Downloader {
	private generator: AsyncGenerator<ClientZipFile>;
	private signal?: AbortSignal;
	private onProgress?: OnProgressTrackerCallback;
	private tracker?: ProgressTracker;

	constructor(generator: AsyncGenerator<ClientZipFile>, { signal, onProgress }: DownloaderParams) {
		this.generator = generator;
		this.signal = signal;
		this.onProgress = onProgress;
	}

	public async save(handle: DownloaderSaveHandle, options: DownloaderSaveOptions): Promise<void> {
		if (this.tracker) {
			console.warn('[VK Music Saver/Downloader] tracker already exists');
		} else if (this.onProgress) {
			this.tracker = new ProgressTracker(this.onProgress, options.size);
		}

		if (handle?.kind === 'directory') {
			console.log('[VK Music Saver/Downloader] Strategy: folder');
			return await this.saveAsFolder(handle, options);
		}

		console.log('[VK Music Saver/Downloader] Strategy: zip');
		await this.saveAsZip(handle, options);
	}

	private async saveAsFolder(dirHandle: FileSystemDirectoryHandle, { name }: DownloaderSaveOptions): Promise<void> {
		for await (const file of this.generator) {
			if (this.signal?.aborted) throw new Error('[VK Music Saver/Downloader/fileSystem] Aborted');

			const trackedFile = this.attachTrackerToZipFile(file);

			try {
				await createFileInDirectory({
					dirHandle,
					subFolderName: name,
					zipFile: trackedFile,
					signal: this.signal,
				});
			} catch (err) {
				console.error(`[VK Music Saver/Downloader/fileSystem] Failed to write file ${file.name}`, err);
			}
		}
	}

	private async saveAsZip(handle: FileSystemFileHandle | null, options: DownloaderSaveOptions): Promise<void> {
		const { makeZip } = await import('client-zip');

		const zipStream = makeZip(this.generator);

		const writable = await this.createZipWritable(handle, options);

		const tracker = this.tracker;

		if (!tracker) {
			return zipStream.pipeTo(writable, { signal: this.signal });
		}

		const progressStream = new TransformStream<Uint8Array, Uint8Array>({
			transform(chunk, controller) {
				if (tracker) {
					tracker.addBytes(chunk.byteLength);
				}

				controller.enqueue(chunk);
			},
		});

		// источник -> счетчик -> диск
		await zipStream.pipeThrough(progressStream).pipeTo(writable, { signal: this.signal });
	}

	private async createZipWritable(
		fileHandle: FileSystemFileHandle | null,
		{ name, size }: DownloaderSaveOptions
	): Promise<WritableStream<Uint8Array>> {
		if (fileHandle) {
			try {
				return await fileHandle.createWritable();
			} catch (error) {
				console.error('[VK Music Saver/Downloader/fileSystem] failed:', error);
			}
		}

		try {
			const { streamSaver } = await import('./streamSaver');

			return streamSaver.createWriteStream(`${name}.zip`, { size });
		} catch (error) {
			console.error('[VK Music Saver/Downloader/streamSaver] failed:', error);
		}

		console.warn('[VK Music Saver/Downloader/classic] use fallback to In-Memory Blob');

		const { default: saveFileAs } = await import('./saveFileAs');

		const chunks: Uint8Array[] = [];

		return new WritableStream<Uint8Array>({
			write(chunk) {
				chunks.push(chunk);
			},
			close() {
				const blob = new Blob(chunks as BlobPart[], { type: 'application/octet-stream' });

				saveFileAs(blob, `${name}.zip`);
			},
			abort(reason) {
				console.warn('[VK Music Saver/Downloader/classic] Download aborted:', reason);

				chunks.length = 0;
			},
		});
	}

	private attachTrackerToZipFile(file: ClientZipFile): ClientZipFile {
		const tracker = this.tracker;

		if (!tracker) return file;

		const { input } = file;

		if (input instanceof ReadableStream) {
			const spyStream = new TransformStream({
				transform(chunk, controller) {
					try {
						const size =
							chunk instanceof Uint8Array ? chunk.byteLength : new TextEncoder().encode(chunk).length;

						tracker.addBytes(size);
					} catch {
						// empty
					}

					controller.enqueue(chunk);
				},
			});

			return { ...file, input: input.pipeThrough(spyStream) };
		}

		let size = 0;
		if (typeof input === 'string') {
			size = new TextEncoder().encode(input).length;
		} else if (input instanceof Uint8Array) {
			size = input.byteLength;
		} else if (input instanceof Blob) {
			size = input.size;
		}

		tracker.addBytes(size);

		return file;
	}
}
