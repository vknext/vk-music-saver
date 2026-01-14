import { LangsCodeEnum } from '@vknext/shared/lib/lang/LangsCodeEnum';

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
	[LangsCodeEnum.Romanian]: 'Romanian',
	[LangsCodeEnum.Spanish]: 'Spanish',
	[LangsCodeEnum.Turkish]: 'Turkish',
	[LangsCodeEnum.Hindi]: 'Hindi',
};

export const getTargetLangPack = async (code: LangsCodeEnum) => {
	try {
		const { default: otherLang } = await import(`../langPack/${langNameMap[code]}`);

		return otherLang;
	} catch (e) {
		console.error(e);
	}

	return {};
};
