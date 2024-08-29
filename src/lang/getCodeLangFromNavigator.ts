import LangsCodeEnum from './LangsCodeEnum';

const getCodeLangFromNavigator = (): LangsCodeEnum => {
	if (/^ru\b/.test(navigator.language)) {
		return LangsCodeEnum.Russian;
	}
	if (/^uk\b/.test(navigator.language)) {
		return LangsCodeEnum.Ukrainian;
	}
	if (/^en\b/.test(navigator.language)) {
		return LangsCodeEnum.English;
	}
	if (/^de\b/.test(navigator.language)) {
		return LangsCodeEnum.German;
	}
	if (/^pl\b/.test(navigator.language)) {
		return LangsCodeEnum.Polish;
	}
	if (/^kk\b/.test(navigator.language)) {
		return LangsCodeEnum.Kazakh;
	}
	if (/^be\b/.test(navigator.language)) {
		return LangsCodeEnum.Belarusian;
	}

	return LangsCodeEnum.English;
};

export default getCodeLangFromNavigator;
