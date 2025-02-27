import waitVK from 'src/globalVars/waitVK';
import defaultLang from '../langPack/default';
import LangsCodeEnum from './LangsCodeEnum';
import getCodeLangFromNavigator from './getCodeLangFromNavigator';

const langNameMap: Record<LangsCodeEnum, string> = {
	[LangsCodeEnum.Russian]: 'default',
	[LangsCodeEnum.Ukrainian]: 'Ukrainian',
	[LangsCodeEnum.English]: 'English',
	[LangsCodeEnum.German]: 'German',
	[LangsCodeEnum.Polish]: 'Polish',
	[LangsCodeEnum.Kazakh]: 'Kazakh',
	[LangsCodeEnum.Belarusian]: 'Belarusian',
	[LangsCodeEnum.Soviet]: 'Soviet',
	[LangsCodeEnum.PortugueseBrazilian]: 'Portuguese, Brazilian',
};

const getTargetPack = async (code: LangsCodeEnum) => {
	try {
		const { default: otherLang } = await import(`../langPack/${langNameMap[code]}`);

		return otherLang;
	} catch (e) {
		console.error(e);
	}

	return {};
};

const getCurrentLangPack = async (): Promise<typeof defaultLang> => {
	await waitVK();

	const code = typeof window.vk?.lang === 'number' ? window.vk.lang : getCodeLangFromNavigator();

	const targetLangPack = await getTargetPack(code);

	return { ...defaultLang, ...targetLangPack };
};

export default getCurrentLangPack;
