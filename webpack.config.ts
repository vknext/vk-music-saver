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
import BomPlugin from 'webpack-utf8-bom';
import yargsParser from 'yargs-parser';

import getManifest from './manifest.config';
import packageJson from './package.json';
import ZipPlugin from './plugins/ZipPlugin';

const argv = yargsParser(process.argv.slice(2));

const files = ['.svg', '.ttf', '.ts', '.css', '.scss', '.json', '.js'];
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
	const entriesForHotReload = ['popup'];

	type Entry = EntryObject | string;

	const entryConfig: Entry = {};

	const defaultEntries: Entry = {
		content: {
			import: path.resolve('./', 'src', 'content.ts'),
			chunkLoading: false,
			runtime: false,
		},
		injected: {
			import: path.resolve('./', 'src', 'injected.ts'),
			publicPath: './',
			runtime: false,
		},
		background: {
			import: path.resolve('./', 'src', 'background', 'index.ts'),
			runtime: false,
			chunkLoading: false,
		},
		popup: path.resolve('./', 'src', 'popup', 'index.ts'),
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
					transform(content, absoluteFrom) {
						if (IS_DEV) return content.toString();

						const json = JSON.parse(content.toString());

						return JSON.stringify(json);
					},
				},
			],
		}),
		new WebpackExtensionManifestPlugin({
			config: manifest,
		}),
		new HtmlWebpackPlugin({
			template: path.resolve('./', 'src', 'popup', 'index.html'),
			filename: 'popup.html',
			chunks: ['popup'],
			inject: true,
			hash: true,
			title: packageJson.name,
		}),
		new BomPlugin(true),
		new ESLintPlugin({}),
		!IS_DEV &&
			new ZipPlugin({
				filename: `vms${manifest.version}_${IS_FIREFOX ? 'firefox' : 'chrome'}.zip`,
				path: path.resolve(`./build`),
			}),
		IS_DEV && new webpack.HotModuleReplacementPlugin(),
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
					{ loader: 'sass-loader', options: { sourceMap: true } },
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
					{ loader: 'sass-loader', options: { sourceMap: true } },
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
