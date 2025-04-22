import { IndexedDBWrapper } from '@vknext/shared/lib/IndexedDBWrapper';
import type { GetTrackDetailsResult } from '@vknext/shared/vkcom/audio/getTrackDetails';
import getUnix from 'src/common/getUnix';

const idb = new IndexedDBWrapper('vms-track-details-v1');

interface TrackDetails extends GetTrackDetailsResult {
	/**
	 * время кеширования
	 */
	timestamp: number;
}

const TrackDetailsStorage = {
	get: async (audioFullId: string): Promise<TrackDetails | null> => {
		if (!audioFullId) return null;

		const result = await idb.get<TrackDetails>(audioFullId);

		if (!result) return null;

		return result;
	},

	set: async (audioFullId: string, data: GetTrackDetailsResult): Promise<void> => {
		await idb.set(audioFullId, { ...data, timestamp: getUnix() });
	},
};

export default TrackDetailsStorage;
