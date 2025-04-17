import { IS_FIREFOX } from 'src/common/constants';
import { AudioConvertMethod } from './enums';

export const AUDIO_CONVERT_METHOD_DEFAULT_VALUE = IS_FIREFOX ? AudioConvertMethod.FFMPEG : AudioConvertMethod.HLS;
