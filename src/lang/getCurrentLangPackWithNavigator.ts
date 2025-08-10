import { getCodeLangFromNavigator } from '@vknext/shared/lib/lang/getCodeLangFromNavigator';
import defaultLang from 'src/langPack/default';
import { getTargetLangPack } from './getTargetLangPack';

const getCurrentLangPackWithNavigator = async (): Promise<typeof defaultLang> => {
	const code = getCodeLangFromNavigator();

	const targetLangPack = await getTargetLangPack(code);

	return { ...defaultLang, ...targetLangPack };
};

export default getCurrentLangPackWithNavigator;
