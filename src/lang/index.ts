import type defaultLang from '../langPack/default';
import getCurrentLangPack from './getCurrentLangPack';

const lang = {
	use(name: keyof typeof defaultLang): string {
		const lang = getCurrentLangPack();

		return lang[name] || name;
	},
};

export default lang;
