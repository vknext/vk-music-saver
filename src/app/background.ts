import { runtime, tabs } from 'webextension-polyfill';

const getUninstallUrl = (): string => {
	const url = new URL('https://vknext.net/uninstall/vms');

	const { version } = runtime.getManifest();

	url.searchParams.set('v', version);

	url.searchParams.set('id', runtime.id);

	return url.href;
};

runtime.setUninstallURL(getUninstallUrl());

runtime.onInstalled.addListener(async ({ reason }) => {
	if (reason === 'install') {
		const url = runtime.getURL('installed.html');

		await tabs.create({ url, active: true });
	}
});
