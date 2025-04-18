import { CustomModalPage } from '@vknext/shared/components/CustomModalPage/CustomModalPage';
import { Div, ModalPageHeader, Separator, Spacing } from '@vkontakte/vkui';
import { IS_FIREFOX } from 'src/common/constants';
import SettControl from 'src/components/SettControl/SettControl';
import VMSLogo from 'src/components/VMSLogo/VMSLogo';
import useLang from 'src/hooks/useLang';
import AudioConvertMethodSelect from './AudioConvertMethodSelect';
import OutsideButton from './OutsideButton/OutsideButton';
import SelectDownloadMethod from './SelectDownloadMethod';
import SelectTrackTemplate from './SelectTrackTemplate';

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
				<SettControl option="numTracksInPlaylist" defaultValue={true}>
					{lang.use('vms_sett_num_tracks_in_playlist')}
				</SettControl>
				<Spacing size={12}>
					<Separator />
				</Spacing>
				{!IS_FIREFOX && <SelectDownloadMethod />}
				<AudioConvertMethodSelect />
			</Div>
		</CustomModalPage>
	);
};

export default SettingsModal;
