import { PanelHeader } from '@vkontakte/vkui';
import useLang from './hooks/useLang';

export const InstalledHeader = () => {
	const lang = useLang();

	return (
		<PanelHeader fixed delimiter="none">
			{lang.use('installed_header_title')}
		</PanelHeader>
	);
};
