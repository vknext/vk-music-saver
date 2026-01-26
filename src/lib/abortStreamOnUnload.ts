interface AbortableStream {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	abort(reason?: any): void | Promise<void>;
}

export const abortStreamOnUnload = (stream?: AbortableStream): (() => void) => {
	const onUnload = () => {
		if (stream) {
			stream.abort('Page unloaded by user');
		} else {
			console.warn('[VK Music Saver/abortStreamOnUnload] stream is not defined');
		}
	};

	const onBeforeUnload = (event: BeforeUnloadEvent) => {
		event.preventDefault();
		event.returnValue = '';
	};

	window.addEventListener('unload', onUnload);
	window.addEventListener('beforeunload', onBeforeUnload);

	return () => {
		window.removeEventListener('unload', onUnload);
		window.removeEventListener('beforeunload', onBeforeUnload);
	};
};
