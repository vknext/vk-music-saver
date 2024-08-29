import defaultLang from '../langPack/default';

// TODO: добавить поддержку других языков. Другие языки нужно подключать динамически
const currentLangPack = defaultLang;

const getCurrentLangPack = () => {
	return currentLangPack;
};

export default getCurrentLangPack;
