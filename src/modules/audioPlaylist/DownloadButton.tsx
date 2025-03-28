import { Button, type ButtonProps } from '@vkontakte/vkui';
import { useState } from 'react';
import downloadPlaylist from 'src/downloaders/downloadPlaylist';
import lang from 'src/lang';

interface DownloadButtonProps extends Pick<ButtonProps, 'appearance' | 'mode' | 'size'> {
	playlistFullId?: string;
}

const DownloadButton = ({ playlistFullId, ...props }: DownloadButtonProps) => {
	const [isLoading, setIsLoading] = useState(false);

	const onClick = async () => {
		if (isLoading) return;

		if (!playlistFullId) {
			window.Notifier.showEvent({ title: 'VK Music Saver', text: lang.use('vms_playlist_not_found') });
			return;
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
