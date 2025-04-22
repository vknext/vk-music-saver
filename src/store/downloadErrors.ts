export class DownloadTaskNotFoundError extends Error {
	constructor(id: string) {
		super(`Download task with ID ${id} not found.`);
		this.name = 'DownloadTaskNotFoundError';
	}
}

export class DownloadTaskAlreadyFinishedError extends Error {
	constructor(id: string) {
		super(`Download task with ID ${id} is already finished.`);
		this.name = 'DownloadTaskAlreadyFinishedError';
	}
}

export class DownloadTaskTimeoutError extends Error {
	constructor(id: string) {
		super(`Download task with ID ${id} has already timed out.`);
		this.name = 'DownloadTaskTimeoutError';
	}
}
