import { CustomModalPage } from '@vknext/shared/components/CustomModalPage/CustomModalPage';
import { Div, ModalPageHeader } from '@vkontakte/vkui';
import { IS_FIREFOX } from 'src/common/constants';
import VMSLogo from 'src/components/VMSLogo/VMSLogo';
import SettControl from 'src/react/components/SettControl/SettControl';
import useLang from 'src/react/hooks/useLang';
import AudioConvertMethodSelect from './AudioConvertMethodSelect';
import SelectDownloadMethod from './SelectDownloadMethod';

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
		>
			<Div>
				<SettControl option="numTracksInPlaylist" defaultValue={true}>
					{lang.use('vms_sett_num_tracks_in_playlist')}
				</SettControl>
				{!IS_FIREFOX && <SelectDownloadMethod />}
				<AudioConvertMethodSelect />
			</Div>
		</CustomModalPage>
	);
};

export default SettingsModal;
