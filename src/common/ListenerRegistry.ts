class ListenerRegistry<T> {
	private _listeners: Set<T> = new Set();

	addListener(callback: T) {
		this._listeners.add(callback);

		return () => this.removeListener(callback);
	}

	removeListener(callback: T) {
		this._listeners.delete(callback);
	}

	get listeners(): ReadonlyArray<T> {
		return [...this._listeners];
	}
}

export default ListenerRegistry;
