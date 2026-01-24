import clearFolder from 'clear-folder';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import ESLintPlugin from 'eslint-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import webpack, { type Configuration, type EntryObject } from 'webpack';
import 'webpack-dev-server'; // для исправления типов
import WebpackExtensionManifestPlugin from 'webpack-extension-manifest-plugin';
import { WebpackManifestPlugin } from 'webpack-manifest-plugin';
import BomPlugin from 'webpack-utf8-bom';

import getManifest from './manifest.config';
import packageJson from './package.json';
import UpdateManifestPlugin from './plugins/UpdateManifestPlugin';
import ZipPlugin from './plugins/ZipPlugin';

const files = ['.svg', '.ttf', '.ts', '.tsx', '.css', '.scss', '.json', '.js'];
const DEFAULT_PUBLIC_PATH = '/';

const getEntry = (isDev: boolean, port: number | string) => {
	const entriesForHotReload = ['popup'];

	type Entry = EntryObject | string;

	const entryConfig: Entry = {};

	const defaultEntries: Entry = {
		vkcom_content: {
			import: path.resolve('./', 'src', 'app', 'vkcom', 'content.ts'),
			chunkLoading: false,
			runtime: false,
		},
		vkcom_injected: {
			import: path.resolve('./', 'src', 'app', 'vkcom', 'injected.ts'),
			publicPath: './',
			runtime: false,
		},
		mvk_content: {
			import: path.resolve('./', 'src', 'app', 'mvk', 'content.ts'),
			chunkLoading: false,
			runtime: false,
		},
		mvk_injected: {
			import: path.resolve('./', 'src', 'app', 'mvk', 'injected.ts'),
			publicPath: './',
			runtime: false,
		},
		background: {
			import: path.resolve('./', 'src', 'app', 'background.ts'),
			runtime: false,
			chunkLoading: false,
		},
		popup: path.resolve('./', 'src', 'app', 'popup', 'index.ts'),
		streamSaverMitm: {
			import: path.resolve('./', 'src', 'app', 'streamSaverMitm', 'index.ts'),
			publicPath: './',
		},
		mitmWorker: {
			import: path.resolve('./', 'src', 'app', 'streamSaverMitm', 'sw.ts'),
			publicPath: './',
			runtime: false,
		},
	};

	if (!isDev) {
		return defaultEntries;
	}

	const getEntryImport = (entryName: string) => {
		const entry = defaultEntries[entryName];

		if (typeof entry === 'string') {
			return entry;
		}

		if ('import' in entry) {
			return entry.import;
		}

		return entry;
	};

	for (const entryName of Object.keys(defaultEntries)) {
		if (entriesForHotReload.includes(entryName)) {
			const hotReloadModules = [
				'webpack/hot/dev-server',
				`webpack-dev-server/client?hot=true&live-reload=true&hostname=localhost&port=${port}`,
			].concat(getEntryImport(entryName));

			if (typeof defaultEntries[entryName] === 'string') {
				entryConfig[entryName] = hotReloadModules;
			} else {
				entryConfig[entryName] = {
					...defaultEntries[entryName],
					import: hotReloadModules,
				};
			}
		}
	}

	return { ...defaultEntries, ...entryConfig };
};

const getCssLoaders = ({
	isModule,
	isSass,
	sourceMap,
	useStyleLoader = false,
	pattern = 'vms[local]--[hash:base64:5]',
}: {
	isModule: boolean;
	isSass: boolean;
	sourceMap: boolean;
	useStyleLoader: boolean;
	pattern?: string;
}) => {
	const loaders: webpack.RuleSetUseItem[] = [
		useStyleLoader
			? {
					loader: 'style-loader',
					options: {
						insert: (element: HTMLElement, options: { target?: HTMLElement }) => {
							const parent = options?.target || document.head || document.documentElement;
							parent.appendChild(element);
						},
					},
				}
			: MiniCssExtractPlugin.loader,
		{
			loader: 'css-loader',
			options: {
				sourceMap,
				modules: isModule
					? {
							localIdentName: pattern,
							mode: 'local',
						}
					: {
							mode: 'icss',
						},
				importLoaders: isSass ? 2 : 1,
			},
		},
		{
			loader: 'postcss-loader',
			options: {
				sourceMap,
				postcssOptions: { plugins: [['postcss-preset-env']] },
			},
		},
	];

	if (isSass) {
		loaders.push({
			loader: 'sass-loader',
			options: {
				sourceMap,
				sassOptions: { silenceDeprecations: ['import'] },
			},
		});
	}

	return loaders;
};

interface EnvParams {
	dev: boolean;
	firefox?: boolean;
	noclear?: boolean;
}

const config = (env: EnvParams): Configuration => {
	const IS_DEV = Boolean(env.dev);
	const IS_FIREFOX = Boolean(env.firefox);

	if (!env.noclear) {
		clearFolder([path.resolve('./', 'build')]);
	}

	const BUILD_PATH = IS_FIREFOX ? path.resolve(`./build/firefox`) : path.resolve(`./build/chrome`);

	const PORT = process.env.PORT || 4001;

	const manifest = getManifest({ isFirefox: IS_FIREFOX, isDev: IS_DEV });

	return {
		target: ['web', 'es2020'],
		entry: getEntry(IS_DEV, PORT),
		mode: IS_DEV ? 'development' : 'production',
		devtool: IS_DEV ? 'source-map' : false,
		devServer: {
			hot: false,
			client: false,
			host: 'localhost',
			port: PORT,
			static: {
				directory: BUILD_PATH,
			},
			devMiddleware: {
				publicPath: `http://localhost:${PORT}/`,
				writeToDisk: true,
			},
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': '*',
				'Access-Control-Allow-Headers': '*',
			},

			allowedHosts: 'all',
		},
		output: {
			path: BUILD_PATH,
			clean: true,
			publicPath: DEFAULT_PUBLIC_PATH,
			environment: {
				arrowFunction: true,
				bigIntLiteral: false,
				const: true,
				destructuring: true,
				dynamicImport: true,
				forOf: true,
				module: false,
				optionalChaining: true,
				templateLiteral: true,
			},
			filename: (pathData) => {
				const chunkName = pathData.chunk?.name || '';

				if (['mitmWorker'].includes(chunkName)) {
					return '[name].vms.js';
				}

				return 'js/[name].vms.js';
			},
			chunkFilename: 'js/[name].vms.js',
		},
		infrastructureLogging: {
			level: 'info',
		},
		resolve: {
			extensions: files,
			plugins: [
				new TsconfigPathsPlugin({
					extensions: files,
				}),
			],
			alias: {
				'@vkontakte/vkui$': '@vkontakte/vkui/dist/cssm',
			},
		},
		optimization: {
			minimize: !IS_DEV,
			minimizer: [
				new TerserPlugin({
					extractComments: false,
					terserOptions: {
						format: {
							comments: false,
						},
					},
				}),
				new CssMinimizerPlugin({
					minimizerOptions: {
						preset: [
							'default',
							{
								calc: false,
							},
						],
					},
				}),
			],
			runtimeChunk: 'single',
			splitChunks: {
				chunks(chunk) {
					const name = chunk.name || '';

					return !name.endsWith('content');
				},
				automaticNameDelimiter: '.',
				minSize: 40_000,
				hidePathInfo: true,
			},
		},
		cache: {
			type: 'filesystem',
			allowCollectingMemory: true,
		},
		plugins: [
			!IS_DEV && new webpack.ProgressPlugin(),
			new ForkTsCheckerWebpackPlugin({ async: !IS_DEV }),
			new webpack.DefinePlugin({
				'process.env.IS_FIREFOX': IS_FIREFOX,
			}),
			new UpdateManifestPlugin({
				buildPath: BUILD_PATH,
				isFirefox: IS_FIREFOX,
			}),
			new MiniCssExtractPlugin({
				filename: 'css/[name].vms.css',
				chunkFilename: 'css/[name].vms.css',
				ignoreOrder: true,
			}),
			new CopyWebpackPlugin({
				patterns: [
					{
						from: './assets',
						to: path.join(BUILD_PATH, 'assets'),
						force: true,
					},
					{
						from: './_locales',
						to: path.join(BUILD_PATH, '_locales'),
						force: true,
					},
					{
						from: path.resolve('./', 'src', 'dnr_rules.json'),
						to: path.join(BUILD_PATH, 'dnr_rules.vms.json'),
					},
				],
			}),
			new WebpackExtensionManifestPlugin({ config: manifest }),
			new HtmlWebpackPlugin({
				template: path.resolve('./', 'src', 'app', 'popup', 'index.html'),
				filename: 'popup.html',
				chunks: ['popup'],
				inject: true,
				hash: true,
				title: packageJson.name,
			}),
			new HtmlWebpackPlugin({
				template: path.resolve('./', 'src', 'app', 'streamSaverMitm', 'index.html'),
				filename: 'mitm.html',
				chunks: ['streamSaverMitm'],
				inject: true,
				hash: true,
				title: 'Stream Saver | mitm',
				publicPath: './',
			}),
			new BomPlugin(true),
			new ESLintPlugin({}),
			!IS_DEV &&
				new ZipPlugin({
					filename: `VKMusicSaver_${IS_FIREFOX ? 'firefox' : 'chrome'}.zip`,
					path: path.resolve(`./build`),
				}),
			IS_DEV && new webpack.HotModuleReplacementPlugin(),
			new WebpackManifestPlugin({
				fileName: 'entrypoints.json',
				generate: (seed, files, entrypoints) => {
					for (const file of files) {
						const runtime = new Set([file.chunk?.runtime]);
						const chunks = file.chunk?.files;

						if (!chunks) continue;

						// @ts-expect-error _groups is private
						for (const item of file.chunk._groups) {
							for (const entry of item._parents) {
								runtime.add(entry.options?.name);
							}
						}

						const rtArray = [...runtime];

						if (rtArray.includes('vkcom_content')) {
							entrypoints.vkcom_content.unshift(...chunks);
						}

						if (rtArray.includes('mvk_content')) {
							entrypoints.mvk_content.unshift(...chunks);
						}
					}

					return entrypoints;
				},
			}),
		],
		module: {
			rules: [
				{
					test: /\.json$/i,
					type: 'asset/resource',
				},
				{
					test: /\.[jt]sx?$/,
					exclude: /node_modules/,
					loader: 'esbuild-loader',
					options: {
						target: ['es2022', 'chrome105', 'edge105', 'firefox115'],
					},
				},
				{
					test: /\.module\.(scss|sass)$/,
					use: getCssLoaders({ isModule: true, isSass: true, useStyleLoader: false, sourceMap: IS_DEV }),
				},
				{
					test: /\.(scss|sass)$/,
					exclude: /\.(module|file)\.(scss|sass)$/,
					use: getCssLoaders({ isModule: false, isSass: true, useStyleLoader: false, sourceMap: IS_DEV }),
					sideEffects: true,
				},
				{
					test: /\.module\.css$/,
					use: getCssLoaders({
						isModule: true,
						isSass: false,
						useStyleLoader: false,
						sourceMap: IS_DEV,
						pattern: 'vkui[local]--[hash:base64:7]',
					}),
				},
				{
					test: /\.css$/,
					exclude: /\.(module)\.css$/,
					use: getCssLoaders({ isModule: false, isSass: false, useStyleLoader: false, sourceMap: IS_DEV }),
					sideEffects: true,
				},
				{
					test: /\.svg$/,
					type: 'asset/source',
				},
			],
		},
	};
};

export default config;
