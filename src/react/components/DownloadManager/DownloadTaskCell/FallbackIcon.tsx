import { Icon24MusicOutline, Icon28PlaylistOutline } from '@vkontakte/icons';
import { DownloadType } from 'src/store';

interface FallbackIconProps {
	type: DownloadType;
}

const FallbackIcon = ({ type: taskType }: FallbackIconProps) => {
	if (taskType === DownloadType.OWNER_MUSIC || taskType === DownloadType.PLAYLIST) {
		return <Icon28PlaylistOutline width={24} height={24} />;
	}

	if (taskType === DownloadType.TRACK) {
		return <Icon24MusicOutline />;
	}

	return null;
};

export default FallbackIcon;
