import { CustomModalPage } from '@vknext/shared/components/CustomModalPage/CustomModalPage';
import { Div, ModalPageHeader, Separator, Spacing } from '@vkontakte/vkui';
import { IS_FIREFOX } from 'src/common/constants';
import SettControl from 'src/components/SettControl/SettControl';
import VMSLogo from 'src/components/VMSLogo/VMSLogo';
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
					<VMSLogo />
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
