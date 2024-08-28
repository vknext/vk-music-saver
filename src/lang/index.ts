import waitCur from 'src/globalVars/waitCur';
import defaultLang from '../langPack/default';

// TODO: добавить поддержку других языков. Другие языки нужно подключать динамически
const initLang = async () => {
	await waitCur();

	if (!window.cur.lang) {
		window.cur.lang = {};
	}

	window.Object.assign(window.cur.lang, defaultLang);
};

export default initLang;
