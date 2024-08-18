class InteractionListener<T = () => void> {
	private _listeners: T[] = [];

	addListener(callback: T) {
		if (!this._listeners.includes(callback)) {
			this._listeners.push(callback);
		}

		return {
			remove: () => this.removeListener(callback),
		};
	}

	removeListener(callback: T) {
		const index = this._listeners.indexOf(callback);

		if (index !== -1) {
			this._listeners.splice(index, 1);
		}
	}

	get listeners() {
		return [...this._listeners];
	}
}

export default InteractionListener;
