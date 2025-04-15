import { Lang } from '@vknext/shared/lib/lang/Lang';
import getCurrentLangPack from './getCurrentLangPack';

const lang = new Lang(await getCurrentLangPack());

export default lang;
