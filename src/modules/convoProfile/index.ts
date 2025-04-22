import { waitRAF } from '@vknext/shared/utils/waitRAF';
import { waitRIC } from '@vknext/shared/utils/waitRIC';
import downloadChatMusic from 'src/downloaders/downloadChatMusic';
import createDownloadAudioButton from 'src/elements/createDownloadAudioButton';
import cancelEvent from 'src/lib/cancelEvent';
import onUserOpenedConvoProfile from 'src/listeners/onUserOpenedConvoProfile';

const initConvoProfile = () => {
	onUserOpenedConvoProfile(async (openedPeer) => {
		if (!openedPeer) return;

		await waitRIC();
		await waitRAF();

		const tab = document.querySelector<HTMLElement>(`.ConvoProfileTabs__tab[id="tab-audios"]`);
		if (!tab) return;

		const after = document.createElement('div');
		after.className = 'vkuiTabsItem__after';

		const { setIsLoading, element, getIsLoading } = createDownloadAudioButton({
			iconSize: 20,
			enableDefaultText: false,
		});

		after.appendChild(element);

		element.addEventListener('click', (event) => {
			cancelEvent(event);

			if (getIsLoading()) return;

			setIsLoading(true);

			downloadChatMusic(openedPeer)
				.catch(console.error)
				.finally(() => {
					setIsLoading(false);
				});
		});

		tab.appendChild(after);
	});
};

export default initConvoProfile;
