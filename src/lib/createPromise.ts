const createPromise = <T>(): {
	promise: Promise<T>;
	resolve: (value: T | PromiseLike<T>) => void;
	reject: (reason?: any) => void;
} => {
	let resolvePromise: (value: T | PromiseLike<T>) => void;
	let rejectPromise: (reason?: any) => void;

	const promise = new Promise<T>((resolve, reject) => {
		resolvePromise = resolve;
		rejectPromise = reject;
	});

	return {
		promise,
		resolve: resolvePromise!,
		reject: rejectPromise!,
	};
};

export default createPromise;
