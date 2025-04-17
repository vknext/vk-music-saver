import { useCustomModalControl } from '@vknext/shared/components/CustomModalPage/CustomModalPageContext';
import { Icon12Dropdown, Icon20Check } from '@vkontakte/icons';
import { SimpleCell } from '@vkontakte/vkui';
import { useEffect, useState } from 'react';
import { getVMSConfig } from 'src/api';
import { ActionsMenuAction, ActionsMenuPopover, ActionsMenuSeparator } from 'src/components/ActionsMenu';
import Badges from 'src/react/components/Badges';
import useLang from 'src/react/hooks/useLang';
import useStorageValue from 'src/react/hooks/useStorageValue';
import showSnackbar from 'src/react/showSnackbar';
import { AUDIO_CONVERT_METHOD_DEFAULT_VALUE } from 'src/storages/constants';
import { AudioConvertMethod } from 'src/storages/enums';

const AudioConvertMethodSelect = () => {
	const lang = useLang();
	const { closeModal } = useCustomModalControl();

	const { value, setValue } = useStorageValue('audioConvertMethod', AUDIO_CONVERT_METHOD_DEFAULT_VALUE);
	const [vknextServerIsAvailable, setVknextServerIsAvailable] = useState(false);
	const [isDeluxe, setIsDeluxe] = useState(false);
	const [deluxeUrl, setDeluxeUrl] = useState('');

	useEffect(() => {
		getVMSConfig().then((config) => {
			if (config.ffmpegConfig) {
				setVknextServerIsAvailable(true);
			}

			if (config.deluxe.url) {
				setDeluxeUrl(config.deluxe.url);
			}

			setIsDeluxe(config.deluxe.enabled);
		});
	}, []);

	const currentMethod = (() => {
		if (vknextServerIsAvailable) return value;

		if (value === AudioConvertMethod.VKNEXT) {
			return AUDIO_CONVERT_METHOD_DEFAULT_VALUE;
		}

		return value;
	})();

	const isFFmpeg = currentMethod === AudioConvertMethod.FFMPEG;
	const isHLS = currentMethod === AudioConvertMethod.HLS;
	const isVKNext = currentMethod === AudioConvertMethod.VKNEXT;

	const getTitle = () => {
		if (isVKNext) return lang.use('vms_sett_audio_convert_mode_vknext');

		if (isFFmpeg) return 'FFmpeg';

		return 'hls.js';
	};

	const onSelectVKNext = () => {
		if (isDeluxe) {
			return setValue(AudioConvertMethod.VKNEXT);
		}

		if (deluxeUrl) {
			window.nav.go(deluxeUrl);
			closeModal();
			return;
		}

		showSnackbar({ type: 'error', text: lang.use('vms_badges_deluxe_function_warning') });
	};

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
							<ActionsMenuSeparator />
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
							{vknextServerIsAvailable && (
								<>
									<ActionsMenuSeparator />
									<ActionsMenuAction
										multiline
										type="primary"
										size="large"
										rightIcon={<Icon20Check visibility={isVKNext ? 'visible' : 'hidden'} />}
										onClick={onSelectVKNext}
										subtitle={lang.use('vms_sett_audio_convert_mode_vknext_desc')}
									>
										<Badges>
											{lang.use('vms_sett_audio_convert_mode_vknext')}
											<Badges.PrimeDeluxe />
										</Badges>
									</ActionsMenuAction>
								</>
							)}
						</>
					}
				>
					<ActionsMenuAction rightIcon={<Icon12Dropdown />}>{getTitle()}</ActionsMenuAction>
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
