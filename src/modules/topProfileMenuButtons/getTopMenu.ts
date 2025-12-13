import { onDocumentComplete } from '@vknext/shared/utils/onDocumentComplete';
import { waitHTMLBody } from '@vknext/shared/utils/waitHTMLBody';

const SELECTORS = [
	'#top_profile_menu',
	'.top_profile_menu',
	'.top_profile_menu_new',
	'.top_profile_menu_react',
	`[class*="EcoPlate-module_menu"]:has(#top_settings_link)`,
].join(',');

/**
 *
 * @version 14.0.4 (vknext)
 */
const getTopMenu = (): Promise<HTMLElement | null> => {
	return new Promise<HTMLElement | null>((resolve) => {
		onDocumentComplete(async () => {
			await waitHTMLBody();

			resolve(document.querySelector<HTMLElement>(SELECTORS));
		});
	});
};

export default getTopMenu;
