import { IndexedDBWrapper } from '@vknext/shared/lib/IndexedDBWrapper';
import type { GlobalStorageBaseKeys, GlobalStorageBaseValues } from './types';

interface ListenersProps<Value> {
	oldValue: Value;
	newValue: Value;
}

class GlobalStorage {
	private idb: IndexedDBWrapper;
	private listeners: Map<string, Set<(props: any) => void>> = new Map();

	constructor() {
		this.idb = new IndexedDBWrapper('vms-global-v1');
	}

	async getValue<Key extends GlobalStorageBaseKeys>(
		key: Key,
		defaultValue: GlobalStorageBaseValues[Key]
	): Promise<GlobalStorageBaseValues[Key]> {
		const result = await this.idb.get<GlobalStorageBaseValues[Key]>(key);

		return result ?? defaultValue;
	}

	async setValue<Key extends GlobalStorageBaseKeys>(key: Key, newValue: GlobalStorageBaseValues[Key]): Promise<void> {
		const oldValue = await this.idb.get<GlobalStorageBaseValues[Key]>(key);

		await this.idb.set(key, newValue);

		this.listeners.get(key)?.forEach((callback) => callback({ oldValue, newValue }));
	}

	removeValue<Key extends GlobalStorageBaseKeys>(key: Key): Promise<void> {
		return this.idb.remove(key);
	}

	addListener<Key extends GlobalStorageBaseKeys>(
		key: Key,
		callback: (props: ListenersProps<GlobalStorageBaseValues[Key]>) => void
	): () => void {
		const listeners = this.listeners.get(key) ?? new Set();

		listeners.add(callback);

		this.listeners.set(key, listeners);

		return () => {
			listeners.delete(callback);
		};
	}

	removeListener<Key extends GlobalStorageBaseKeys>(
		key: Key,
		callback: (props: ListenersProps<GlobalStorageBaseValues[Key]>) => void
	): void {
		if (!this.listeners.has(key)) return;

		const listeners = this.listeners.get(key)!;

		listeners.delete(callback);

		this.listeners.set(key, listeners);
	}

	async clearDatabase() {
		await this.idb.clearDatabase();
	}
}

export default new GlobalStorage();
