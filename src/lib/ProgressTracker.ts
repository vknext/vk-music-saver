export interface ProgressTrackerStats {
	loaded: number;
	total?: number;
	/**
	 * байты в секунду
	 */
	speed: number; // Байты в секунду
	/**
	 * секунд осталось (если известен total)
	 */
	eta?: number;
}

export type OnProgressTrackerCallback = (stats: ProgressTrackerStats) => void;

export class ProgressTracker {
	private startTime = Date.now();
	private lastUpdate = 0;
	private loaded = 0;
	private total?: number;
	private onProgress: OnProgressTrackerCallback;

	constructor(onProgress: OnProgressTrackerCallback, total?: number) {
		this.onProgress = onProgress;
		this.total = total;
	}

	public addBytes(bytes: number) {
		this.loaded += bytes;

		this.emitIfNeeded();
	}

	private emitIfNeeded() {
		const now = Date.now();

		// throttle: не чаще 200 мс
		if (now - this.lastUpdate < 200 && this.loaded !== this.total) return;

		const timeElapsed = (now - this.startTime) / 1000;
		const speed = timeElapsed > 0 ? this.loaded / timeElapsed : 0;

		let eta: number | undefined;
		if (this.total && speed > 0) {
			const remainingBytes = this.total - this.loaded;
			eta = Math.ceil(remainingBytes / speed);
		}

		this.onProgress({
			loaded: this.loaded,
			total: this.total,
			speed,
			eta,
		});

		this.lastUpdate = now;
	}
}
