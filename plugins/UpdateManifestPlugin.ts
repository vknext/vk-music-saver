import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import type { ExtensionTypes, Manifest } from 'webextension-polyfill';
import type { Compiler } from 'webpack';
import webpackSources from 'webpack-sources';

const VKCOM_MATCHES = ['https://vk.com/*', 'https://vk.ru/*'];
const MVK_MATCHES = ['https://m.vk.com/*', 'https://m.vk.ru/*'];

interface Options {
	buildPath: string;
	isFirefox: boolean;
}

interface ConvertEntryToContentScriptProps {
	entry: string[];
	matches?: Manifest.MatchPattern[];
	runAt?: ExtensionTypes.RunAt;
	all_frames?: boolean;
}

interface ContentScript extends Omit<Manifest.ContentScript, 'matches'> {
	matches?: Manifest.MatchPattern[];
}

/**
 * Здесь добавляем скрипты и стили в манифест
 * @see https://github.com/vknext/vknext
 */
export default class UpdateManifestPlugin {
	options: Options;

	constructor(options: Options) {
		this.options = options;
	}

	convertEntryToContentScript({ entry, matches, runAt, all_frames }: ConvertEntryToContentScriptProps) {
		let contentScript: ContentScript = {};

		if (matches) {
			contentScript.matches = matches;
		}

		if (runAt) {
			contentScript.run_at = runAt;
		}

		if (all_frames) {
			contentScript.all_frames = true;
		}

		for (const file of entry) {
			const { buildPath } = this.options;

			const extension = file.split('.').pop() as keyof Pick<ContentScript, 'js' | 'css'>;

			if (!extension) continue;

			if (['js', 'css'].includes(extension)) {
				if (!existsSync(join(buildPath, file))) {
					console.warn(`Файл ${file} не существует`);
					continue;
				}

				if (!contentScript[extension]) {
					contentScript[extension] = [];
				}

				if (contentScript[extension]!.includes(file)) {
					continue;
				}

				contentScript[extension]!.push(file);
			} else {
				console.warn(`Неизвестный файл ${file}`);
			}
		}

		return contentScript;
	}

	apply(compiler: Compiler) {
		compiler.hooks.afterEmit.tap('UpdateManifestPlugin', (compilation) => {
			const { buildPath, isFirefox } = this.options;

			const mf = readFileSync(join(buildPath, 'manifest.json'), { encoding: 'utf-8' });
			const entry = readFileSync(join(buildPath, 'entrypoints.json'), { encoding: 'utf-8' });

			const manifest = JSON.parse(mf);
			const entrypoints = JSON.parse(entry);

			const vkComContentScript = this.convertEntryToContentScript({
				entry: entrypoints.vkcom_content,
				matches: VKCOM_MATCHES,
				runAt: 'document_start',
			});

			const mvkContentScript = this.convertEntryToContentScript({
				entry: entrypoints.mvk_content,
				matches: MVK_MATCHES,
				runAt: 'document_start',
			});

			const vkComInjectedScript = this.convertEntryToContentScript({
				entry: entrypoints.vkcom_injected,
			});

			const mvkInjectedScript = this.convertEntryToContentScript({
				entry: entrypoints.mvk_injected,
			});

			for (const [contentScript, injectedScript] of [
				[vkComContentScript, vkComInjectedScript],
				[mvkContentScript, mvkInjectedScript],
			]) {
				if (injectedScript.css) {
					contentScript.css = Array.from(new Set((contentScript.css || []).concat(injectedScript.css)));
				}

				if (contentScript.js?.[0]) {
					const firstScript = contentScript.js[0];
					const code = readFileSync(join(buildPath, firstScript), { encoding: 'utf-8' });

					writeFileSync(
						resolve(buildPath, firstScript),
						`window.vms=${JSON.stringify(injectedScript.js)};${code}`,
						{ encoding: 'utf-8' }
					);
				} else {
					console.warn(`content script not found`);
				}
			}

			const contentScriptsList = [vkComContentScript, mvkContentScript];

			if (manifest.content_scripts) {
				manifest.content_scripts.push(...contentScriptsList);
			} else {
				manifest.content_scripts = contentScriptsList;
			}

			if (entrypoints.serviceWorker && entrypoints.serviceWorker.length) {
				if (isFirefox) {
					manifest.background = {
						scripts: entrypoints.serviceWorker,
					};
				} else {
					manifest.background = {
						service_worker: entrypoints.serviceWorker[0],
					};
				}
			}

			const manifestString = JSON.stringify(manifest);
			writeFileSync(join(buildPath, 'manifest.json'), manifestString);

			const manifestSource = new webpackSources.ConcatSource(manifestString);
			// @ts-ignore
			compilation.assets['manifest.json'] = manifestSource;

			unlinkSync(join(buildPath, 'entrypoints.json'));
		});
	}
}
