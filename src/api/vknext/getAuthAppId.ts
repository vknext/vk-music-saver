import vknextApiUrl from './vknextApiUrl';

const getAuthAppId = async (): Promise<number> => {
	try {
		const response = await fetch(`${vknextApiUrl}/vms.getAuthAppId`, {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'Api-Version': 'vms-1',
			},
		});

		if (response.ok) {
			return parseInt(await response.text());
		}
	} catch (e) {
		console.error(`[VK Music Saver/getAuthAppId] Error:`, e);
	}

	return 53448184;
};

export default getAuthAppId;
