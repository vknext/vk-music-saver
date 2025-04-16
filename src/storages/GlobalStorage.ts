import { IndexedDBWrapper } from '@vknext/shared/lib/IndexedDBWrapper';
import type { GlobalStorageBaseKeys, GlobalStorageBaseValues } from './types';

const idb = new IndexedDBWrapper('vms-global-v1');

const GlobalStorage = {
	async getValue<Key extends GlobalStorageBaseKeys>(
		key: Key,
		defaultValue: GlobalStorageBaseValues[Key]
	): Promise<GlobalStorageBaseValues[Key]> {
		const result = await idb.get<GlobalStorageBaseValues[Key]>(key);

		return result ?? defaultValue;
	},

	async setValue<Key extends GlobalStorageBaseKeys>(key: Key, value: GlobalStorageBaseValues[Key]): Promise<void> {
		await idb.set(key, value);
	},

	removeValue<Key extends GlobalStorageBaseKeys>(key: Key): Promise<void> {
		return idb.remove(key);
	},
};

export default GlobalStorage;
