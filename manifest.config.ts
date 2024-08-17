import packageJson from './package.json';
const { version } = packageJson;

interface GetManifestOptions {
	isFirefox: boolean;
	isDev: boolean;
}

const getManifest = ({ isFirefox, isDev }: GetManifestOptions) => {
	const manifest: Record<string, any> = {
		manifest_version: 3,
		name: '__MSG_extName__',
		version,
		short_name: 'vknext-vms',
		description: '__MSG_extDescription__',
		homepage_url: 'https://vknext.net',
		default_locale: 'ru',
		// в VK Next эти скрипты генерируются автоматически. VMS максимально простое расширение, тут такого не нужно.
		content_scripts: [
			{
				js: ['content.vms.js', 'injected.vms.js'],
				css: ['injected.vms.css'],
				matches: ['https://vk.com/*', 'https://vk.ru/*'],
				run_at: 'document_idle',
			},
		],
		icons: {
			'16': 'assets/icon16.png',
			'24': 'assets/icon24.png',
			'32': 'assets/icon32.png',
			'48': 'assets/icon48.png',
			'128': 'assets/icon128.png',
			'300': 'assets/icon300.png',
		},
		web_accessible_resources: [
			{
				resources: ['injected.vms.js'],
				matches: ['https://vk.com/*', 'https://vk.ru/*'],
			},
		],
		// в Firefox не поддерживается `split`. О боже какой крутой браузер!!! базовые свойства не может поддерживать.
		incognito: isFirefox ? 'not_allowed' : 'split',
	};

	if (isDev) {
		manifest.web_accessible_resources[0].resources.push('*.map');
	}

	// TODO: протестировать на старых версиях браузеров
	if (isFirefox) {
		manifest.browser_specific_settings = {
			gecko: {
				id: 'vknext-vms@vknext.net',
				strict_min_version: '113.0',
			},
		};
	} else {
		manifest.minimum_chrome_version = '101';
	}

	return manifest;
};

export default getManifest;
