import { IconLogoVkMusicSaverColorWithText38h } from '@vknext/icons';
import { CustomModalPage } from '@vknext/shared/components/CustomModalPage/CustomModalPage';
import { Div, ModalPageHeader, Separator, Spacing } from '@vkontakte/vkui';
import { IS_FIREFOX } from 'src/common/constants';
import SettControl from 'src/components/SettControl/SettControl';
import useLang from 'src/hooks/useLang';
import AudioConvertMethodSelect from './features/AudioConvertMethodSelect';
import SelectDownloadMethod from './features/SelectDownloadMethod';
import SelectTrackTemplate from './features/SelectTrackTemplate';
import WriteGeniusLyrics from './features/WriteGeniusLyrics';
import OutsideButton from './OutsideButton/OutsideButton';

const SettingsModal = () => {
	const lang = useLang();

	return (
		<CustomModalPage
			size={500}
			header={
				<ModalPageHeader>
					<IconLogoVkMusicSaverColorWithText38h height={34} width={213} />
				</ModalPageHeader>
			}
			outsideButtons={<OutsideButton />}
			noFocusToDialog
		>
			<Div>
				<SelectTrackTemplate />
				<SettControl option="num_tracks_in_playlist" defaultValue={true}>
					{lang.use('vms_sett_num_tracks_in_playlist')}
				</SettControl>
				<SettControl
					option="add_leading_zeros"
					defaultValue={false}
					subtitle={lang.use('vms_sett_add_leading_zeros_desc')}
				>
					{lang.use('vms_sett_add_leading_zeros')}
				</SettControl>
				<SettControl option="download_playlist_in_reverse" defaultValue={false}>
					{lang.use('vms_sett_download_playlist_in_reverse')}
				</SettControl>
				<Spacing size={12}>
					<Separator />
				</Spacing>
				{!IS_FIREFOX && <SelectDownloadMethod />}
				<AudioConvertMethodSelect />
				<Spacing size={12}>
					<Separator />
				</Spacing>
				<SettControl
					option="audio_write_id3_tags"
					defaultValue={true}
					subtitle={lang.use('vms_sett_audio_write_id3_tags_desc')}
				>
					{lang.use('vms_sett_audio_write_id3_tags')}
				</SettControl>
				<WriteGeniusLyrics />
			</Div>
		</CustomModalPage>
	);
};

export default SettingsModal;
