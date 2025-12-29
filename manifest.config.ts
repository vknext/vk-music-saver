import packageJson from './package.json';
const { version } = packageJson;

const CHROME_KEY =
	'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1dt2cQbEmETmcM7gLtXmI+0SsaznQx/7mYwXqIong2grAcOHAq7rT74ps30stZYVIUiR8G0RAoT0AJSotIgiRxwWLa7ErUU6eHSg+gGTP9WAk1n22KsmywubXPCFpomYeUC8XQfq2qrbpuxoX/dd8Y/4D25jGnO66pace9aD1kCHfYi3zb+h/jpaP0xxvQWUiw9MO9zZSKanAJu5tyd+Uzf0JakXWdubZ1qHwt4UmMQFdhtiCBda6cHUSKCpawUJGDvHdTWVoTARg1HsqMs0nlHnoY4mm7vHWKdhu9nDudenuqwPdH2OVNS/lERWpxhxPy0WAC1DdoidNeJUDJ9P6QIDAQAB';

interface GetManifestOptions {
	isFirefox: boolean;
	isDev: boolean;
}

const browser_action = {
	default_title: '__MSG_popup_title__',
	default_popup: 'popup.html',
};

const VK_HOST = ['https://vk.com/*', 'https://vk.ru/*', 'https://m.vk.com/*', 'https://m.vk.ru/*'];

const getManifest = ({ isFirefox, isDev }: GetManifestOptions) => {
	const manifest: Record<string, any> = {
		manifest_version: 3,
		name: '__MSG_extName__',
		version,
		short_name: 'vknext-vms',
		description: '__MSG_extDescription__',
		homepage_url: 'https://vknext.net',
		default_locale: 'ru',
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
				resources: ['*'],
				matches: VK_HOST,
			},
		],
		permissions: ['declarativeNetRequestWithHostAccess'],
		declarative_net_request: {
			rule_resources: [
				{
					id: 'ruleset',
					enabled: true,
					path: 'dnr_rules.vms.json',
				},
			],
		},
		host_permissions: VK_HOST.concat('https://api.genius.com/*'),
	};

	if (isDev) {
		manifest.web_accessible_resources[0].resources.push('*.map');
	}

	// TODO: протестировать на старых версиях Firefox
	if (isFirefox) {
		manifest.manifest_version = 2;

		manifest.background = {
			scripts: ['background.vms.js'],
		};

		manifest.browser_specific_settings = {
			gecko: {
				id: 'vknext-vms@vknext.net',
				strict_min_version: '115.0',
			},
		};

		manifest.browser_action = browser_action;

		if (manifest.web_accessible_resources) {
			const resources = manifest.web_accessible_resources.map((e: any) => {
				if (typeof e === 'string') {
					return e;
				}

				return e.resources;
			});

			manifest.web_accessible_resources = resources.flat();
		}

		if (manifest.host_permissions) {
			manifest.permissions = Array.from(new Set([...(manifest.permissions || []), ...manifest.host_permissions]));
			delete manifest.host_permissions;
		}
	} else {
		manifest.minimum_chrome_version = '105';
		manifest.key = CHROME_KEY;
		manifest.incognito = 'split';
		manifest.action = browser_action;

		manifest.background = {
			service_worker: 'background.vms.js',
		};
	}

	return manifest;
};

export default getManifest;
