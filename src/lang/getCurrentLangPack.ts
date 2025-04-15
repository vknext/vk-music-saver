import { LangsCodeEnum } from '@vknext/shared/lib/lang/LangsCodeEnum';
import { getCodeLangFromNavigator } from '@vknext/shared/lib/lang/getCodeLangFromNavigator';
import { waitVK } from '@vknext/shared/vkcom/globalVars/waitVK';
import defaultLang from '../langPack/default';

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
	const vk = await waitVK();

	const code = typeof vk?.lang === 'number' ? vk.lang : getCodeLangFromNavigator();

	const targetLangPack = await getTargetPack(code);

	return { ...defaultLang, ...targetLangPack };
};

export default getCurrentLangPack;
