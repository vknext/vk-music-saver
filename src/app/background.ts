const runtime = (chrome || browser).runtime;

const getUninstallUrl = (): string => {
	const url = new URL('https://vknext.net/uninstall/vms');

	const { version } = runtime.getManifest();

	url.searchParams.set('v', version);

	url.searchParams.set('id', runtime.id);

	return url.href;
};

runtime.setUninstallURL(getUninstallUrl());
