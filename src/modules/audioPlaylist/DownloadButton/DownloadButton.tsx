import { Icon28LogoMiniVkMusicSaverColor } from '@vknext/icons';
import { Button, type ButtonProps } from '@vkontakte/vkui';

import { ActionsMenuAction, ActionsMenuPopover } from 'src/components/ActionsMenu';
import downloadPlaylist from 'src/downloaders/downloadPlaylist';
import downloadPlaylistCover from 'src/downloaders/downloadPlaylistCover';
import useLang from 'src/hooks/useLang';
import showSnackbar from 'src/react/showSnackbar';
import styles from './DownloadButton.module.scss';

interface DownloadButtonProps extends Pick<ButtonProps, 'appearance' | 'mode' | 'size'> {
	playlistFullId?: string;
}

const DownloadButton = ({ playlistFullId, ...props }: DownloadButtonProps) => {
	const lang = useLang();

	const getFullId = () => {
		const playlistFullId = location.pathname.split('/').at(-1);
		if (!playlistFullId) {
			throw new Error('playlist id not found');
		}

		return playlistFullId;
	};

	const onDownloadClick = async () => {
		if (!playlistFullId) {
			return await showSnackbar({
				type: 'error',
				text: 'VK Music Saver',
				subtitle: lang.use('vms_playlist_not_found'),
			});
		}

		try {
			await downloadPlaylist(playlistFullId);
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<ActionsMenuPopover
			trigger="hover"
			placement="bottom-end"
			hideOnClick
			actions={
				<>
					<ActionsMenuAction type="primary" onClick={onDownloadClick}>
						{lang.use('vms_download_playlist')}
					</ActionsMenuAction>
					<ActionsMenuAction
						type="primary"
						onClick={() => downloadPlaylistCover(playlistFullId || getFullId())}
					>
						{lang.use('vms_download_cover')}
					</ActionsMenuAction>
				</>
			}
		>
			<Button size="m" className={styles.DownloadButton} {...props}>
				<Icon28LogoMiniVkMusicSaverColor width={24} height={24} />
			</Button>
		</ActionsMenuPopover>
	);
};

export default DownloadButton;
