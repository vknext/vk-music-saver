const convertBlobToUint8Array = (blob: Blob): Promise<Uint8Array> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = (event: ProgressEvent<FileReader>) => {
			if (event.target && event.target.result instanceof ArrayBuffer) {
				const arrayBuffer: ArrayBuffer = event.target.result;
				const uint8Array = new Uint8Array(arrayBuffer);
				resolve(uint8Array);
			} else {
				reject(new Error('Invalid result'));
			}
		};

		reader.onerror = (error) => {
			reject(error);
		};

		reader.readAsArrayBuffer(blob);
	});
};

export default convertBlobToUint8Array;
