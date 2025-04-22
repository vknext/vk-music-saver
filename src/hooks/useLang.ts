import { LangReact } from '@vknext/shared/lib/lang/LangReact';
import getCurrentLangPack from 'src/lang/getCurrentLangPack';

const lang = new LangReact(await getCurrentLangPack());

const useLang = () => {
	return lang;
};

export default useLang;
