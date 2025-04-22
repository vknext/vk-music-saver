import { createPromise } from '@vknext/shared/utils/createPromise';
import { onDocumentComplete } from '@vknext/shared/utils/onDocumentComplete';
import { waitHTMLBody } from '@vknext/shared/utils/waitHTMLBody';

/**
 *
 * @version 14.0 (vknext)
 */
const getTopMenu = (): Promise<HTMLElement | null> => {
	const { promise, resolve } = createPromise<HTMLElement | null>();

	onDocumentComplete(async () => {
		await waitHTMLBody();

		resolve(
			document.querySelector<HTMLElement>(
				'#top_profile_menu,.top_profile_menu,.top_profile_menu_new,.top_profile_menu_react'
			)
		);
	});

	return promise;
};

export default getTopMenu;
