import archiver from 'archiver';
import { createWriteStream } from 'fs';
import path from 'path';
import type { Compiler } from 'webpack';

const zipDirectory = (sourceDir: string, outPath: string) => {
	const archive = archiver('zip', { zlib: { level: 9 }, gzip: true, gzipOptions: { level: 9 } });
	const stream = createWriteStream(outPath);

	return new Promise<void>((resolve, reject) => {
		archive
			.directory(sourceDir, false)
			.on('error', (err: unknown) => reject(err))
			.pipe(stream);

		stream.on('close', () => resolve());
		archive.finalize();
	});
};

export interface ZipPluginOptions {
	filename?: string;
	path?: string;
}

export default class ZipPlugin {
	filename: string;
	path: string;

	constructor(options: ZipPluginOptions = {}) {
		this.filename = options.filename || 'bundle.zip';
		this.path = options.path || '.';
	}

	apply(compiler: Compiler) {
		compiler.hooks.done.tap('ZipPlugin', (stats) => {
			const zipPath = path.resolve(this.path, this.filename);
			const outputPath = stats.compilation.outputOptions.path!;

			zipDirectory(outputPath, zipPath);
		});
	}
}
