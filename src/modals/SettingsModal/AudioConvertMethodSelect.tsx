import { Icon12Dropdown, Icon20Check } from '@vkontakte/icons';
import { SimpleCell } from '@vkontakte/vkui';
import { ActionsMenuAction, ActionsMenuPopover } from 'src/components/ActionsMenu';
import useLang from 'src/react/hooks/useLang';
import useStorageValue from 'src/react/hooks/useStorageValue';
import { AUDIO_CONVERT_METHOD_DEFAULT_VALUE } from 'src/storages/constants';
import { AudioConvertMethod } from 'src/storages/enums';

const AudioConvertMethodSelect = () => {
	const lang = useLang();

	const { value, setValue } = useStorageValue('audioConvertMethod', AUDIO_CONVERT_METHOD_DEFAULT_VALUE);

	const isFFmpeg = value === AudioConvertMethod.FFMPEG;
	const isHLS = value === AudioConvertMethod.HLS;

	return (
		<SimpleCell
			after={
				<ActionsMenuPopover
					placement="bottom-end"
					actions={
						<>
							<ActionsMenuAction
								multiline
								type="primary"
								size="large"
								rightIcon={<Icon20Check visibility={isFFmpeg ? 'visible' : 'hidden'} />}
								onClick={() => setValue(AudioConvertMethod.FFMPEG)}
								subtitle={lang.use('vms_sett_audio_convert_mode_ffmpeg_desc')}
							>
								FFmpeg
							</ActionsMenuAction>
							<ActionsMenuAction
								multiline
								type="primary"
								size="large"
								rightIcon={<Icon20Check visibility={isHLS ? 'visible' : 'hidden'} />}
								onClick={() => setValue(AudioConvertMethod.HLS)}
								subtitle={lang.use('vms_sett_audio_convert_mode_hlsjs_desc')}
							>
								hls.js
							</ActionsMenuAction>
						</>
					}
				>
					<ActionsMenuAction rightIcon={<Icon12Dropdown />}>
						{isFFmpeg ? 'FFmpeg' : 'hls.js'}
					</ActionsMenuAction>
				</ActionsMenuPopover>
			}
			multiline
			subtitle={lang.use('vms_sett_audio_convert_mode_desc')}
		>
			{lang.use('vms_sett_audio_convert_mode_title')}
		</SimpleCell>
	);
};

export default AudioConvertMethodSelect;
