import { ListenerRegistry } from '@vknext/shared/common/ListenerRegistry';
import addMEAppListener from './addMEAppListener';

type TCallback = (openedPeer: number, isLinkWithHistory: boolean) => void;

const interaction = new ListenerRegistry<TCallback | void>();

interface EventUserOpenedConvoProfile {
	type: 'UserOpenedConvoProfile';
	peerId: number;
	isLinkWithHistory: boolean;
}

addMEAppListener((event: EventUserOpenedConvoProfile) => {
	if (event.type === 'UserOpenedConvoProfile') {
		for (const callback of interaction.listeners) {
			try {
				callback?.(event.peerId, event.isLinkWithHistory);
			} catch (e) {
				console.error(e);
			}
		}
	}
}, true);

const onUserOpenedConvoProfile = (callback: TCallback) => {
	return interaction.addListener(callback);
};

export default onUserOpenedConvoProfile;
