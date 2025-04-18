import { Icon28LogoMiniVkMusicSaverColor } from '@vknext/icons';
import EcoPlateItem from 'src/components/EcoPlateItem/EcoPlateItem';
import showSettingsModal from 'src/modals/showSettingsModal';
import useLang from 'src/hooks/useLang';

const EcoPlateButtons = () => {
	const lang = useLang();

	return (
		<EcoPlateItem
			icon={<Icon28LogoMiniVkMusicSaverColor width={20} height={20} />}
			onClick={() => {
				showSettingsModal();

				window.TopMenu.hide();
			}}
		>
			{lang.use('vms_settings_title')}
		</EcoPlateItem>
	);
};

export default EcoPlateButtons;
