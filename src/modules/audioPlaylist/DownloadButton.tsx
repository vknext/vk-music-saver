import { Button, type ButtonProps } from '@vkontakte/vkui';
import { useState } from 'react';
import downloadPlaylist from 'src/downloaders/downloadPlaylist';
import lang from 'src/lang';
import showSnackbar from 'src/react/showSnackbar';

interface DownloadButtonProps extends Pick<ButtonProps, 'appearance' | 'mode' | 'size'> {
	playlistFullId?: string;
}

const DownloadButton = ({ playlistFullId, ...props }: DownloadButtonProps) => {
	const [isLoading, setIsLoading] = useState(false);

	const onClick = async () => {
		if (isLoading) return;

		if (!playlistFullId) {
			return await showSnackbar({
				type: 'error',
				text: 'VK Music Saver',
				subtitle: lang.use('vms_playlist_not_found'),
			});
		}

		setIsLoading(true);

		try {
			await downloadPlaylist(playlistFullId);
		} catch (error) {
			console.error(error);
		}

		setIsLoading(false);
	};

	return (
		<Button loading={isLoading} onClick={onClick} {...props}>
			{lang.use('vms_download')}
		</Button>
	);
};

export default DownloadButton;
