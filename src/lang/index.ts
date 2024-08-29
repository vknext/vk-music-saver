import getCurrentLangPack from './getCurrentLangPack';
import Lang from './Lang';

const lang = new Lang(await getCurrentLangPack());

export default lang;
