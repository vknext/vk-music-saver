import clearFolder from 'clear-folder';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import ESLintPlugin from 'eslint-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import path from 'path';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import webpack, { type Configuration, type EntryObject } from 'webpack';
import 'webpack-dev-server'; // для исправления типов
import WebpackExtensionManifestPlugin from 'webpack-extension-manifest-plugin';
import { WebpackManifestPlugin } from 'webpack-manifest-plugin';
// @ts-expect-error нет типов :(
import BomPlugin from 'webpack-utf8-bom';
import yargsParser from 'yargs-parser';

import getManifest from './manifest.config';
import packageJson from './package.json';
import UpdateManifestPlugin from './plugins/UpdateManifestPlugin';
import ZipPlugin from './plugins/ZipPlugin';

const argv = yargsParser(process.argv.slice(2));

const files = ['.svg', '.ttf', '.ts', '.tsx', '.css', '.scss', '.json', '.js'];
const DEFAULT_PUBLIC_PATH = '/';

if (!argv.noclear) {
	clearFolder([path.resolve('./', 'build')]);
}

const IS_DEV = Boolean(argv.dev);
const IS_FIREFOX = Boolean(argv.firefox);

const BUILD_PATH = IS_FIREFOX ? path.resolve(`./build/firefox`) : path.resolve(`./build/chrome`);

const PORT = process.env.PORT || 4001;

const manifest = getManifest({ isFirefox: IS_FIREFOX, isDev: IS_DEV });

const getEntry = () => {
	const entriesForHotReload = ['popup', 'installed'];

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
		installed: path.resolve('./', 'src', 'app', 'installed', 'index.tsx'),
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

	if (!IS_DEV) {
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
				`webpack-dev-server/client?hot=true&live-reload=true&hostname=localhost&port=${PORT}`,
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

const postcssOptions = {
	plugins: [['postcss-preset-env']],
};

const options: Configuration = {
	entry: getEntry(),
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
		filename: '[name].vms.js',
		chunkFilename: '[name].vms.js',
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
		runtimeChunk: 'single',
		splitChunks: {
			chunks(chunk) {
				const name = chunk.name || '';

				if (name.endsWith('content')) return false;

				return true;
			},
			automaticNameDelimiter: '.',
			minSize: 40_000,
		},
	},
	cache: {
		type: 'filesystem',
		allowCollectingMemory: true,
	},
	plugins: [
		new webpack.DefinePlugin({
			'process.env.IS_FIREFOX': IS_FIREFOX,
		}),
		new UpdateManifestPlugin({
			buildPath: BUILD_PATH,
			isFirefox: IS_FIREFOX,
		}),
		new MiniCssExtractPlugin({
			filename: '[name].vms.css',
			chunkFilename: '[name].vms.css',
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
					// бюджетная минификация .json
					transform(content) {
						if (IS_DEV) return content.toString();

						const json = JSON.parse(content.toString());

						return JSON.stringify(json);
					},
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
			template: path.resolve('./', 'src', 'app', 'installed', 'index.html'),
			filename: 'installed.html',
			chunks: ['installed'],
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
				filename: `vms${manifest.version}_${IS_FIREFOX ? 'firefox' : 'chrome'}.zip`,
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
	].filter(Boolean),
	module: {
		rules: [
			{
				test: /\.json$/i,
				type: 'asset/resource',
			},
			{
				test: /\.[jt]sx?$/,
				loader: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.module\.(scss|sass)$/,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: 'css-loader',
						options: {
							sourceMap: IS_DEV,
							modules: {
								localIdentName: 'vms[local]--[hash:base64:5]',
								mode: 'local',
							},
						},
					},
					{
						loader: 'postcss-loader',
						options: {
							sourceMap: true,
							postcssOptions: {
								plugins: [['postcss-preset-env']],
							},
						},
					},
					{
						loader: 'sass-loader',
						options: {
							sourceMap: true,
							sassOptions: {
								silenceDeprecations: ['import'],
							},
						},
					},
				],
			},
			{
				test: /\.(scss|sass)$/,
				exclude: /\.(module|file)\.(scss|sass)$/,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: 'css-loader',
						options: {
							sourceMap: IS_DEV,
							importLoaders: 3,
							modules: {
								mode: 'icss',
							},
						},
					},
					{
						loader: 'postcss-loader',
						options: {
							sourceMap: true,
							postcssOptions: {
								plugins: [['postcss-preset-env']],
							},
						},
					},
					{
						loader: 'sass-loader',
						options: {
							sourceMap: true,
							sassOptions: {
								silenceDeprecations: ['import'],
							},
						},
					},
				],
				sideEffects: true,
			},
			{
				test: /\.module\.css$/,
				use: [
					{
						loader: 'style-loader',
						options: {
							insert: (element: HTMLElement, options: { target?: HTMLElement }) => {
								const parent = options?.target || document.head || document.documentElement;

								parent.appendChild(element);
							},
						},
					},
					{
						loader: 'css-loader',
						options: {
							sourceMap: IS_DEV,
							modules: {
								// длина хеша должна быть больше чем в VK Next чтобы избежать конфликтов
								localIdentName: 'vkui[local]--[hash:base64:7]',
								mode: 'local',
							},
						},
					},
					{ loader: 'postcss-loader', options: { sourceMap: true, postcssOptions } },
					{
						loader: 'sass-loader',
						options: {
							sourceMap: true,
							sassOptions: {
								silenceDeprecations: ['import'],
							},
						},
					},
				],
			},
			{
				test: /\.css$/,
				exclude: /\.(module)\.css$/,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: 'css-loader',
						options: {
							sourceMap: IS_DEV,
							importLoaders: 2,
							modules: {
								mode: 'icss',
							},
						},
					},
					{ loader: 'postcss-loader', options: { sourceMap: true, postcssOptions } },
				],
				sideEffects: true,
			},
			{
				test: /\.svg$/,
				use: 'raw-loader',
			},
		],
	},
};

export default options;
