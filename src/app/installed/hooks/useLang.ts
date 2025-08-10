import { LangReact } from '@vknext/shared/lib/lang/LangReact';
import getCurrentLangPackWithNavigator from 'src/lang/getCurrentLangPackWithNavigator';

const lang = new LangReact(await getCurrentLangPackWithNavigator());

const useLang = () => {
	return lang;
};

export default useLang;
