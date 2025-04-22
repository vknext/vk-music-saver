import { createPromise } from '@vknext/shared/utils/createPromise';

class TaskLimiter<T> {
	private readonly maxConcurrency: number;
	private runningCount = 0;
	private readonly taskQueue: (() => Promise<void>)[] = [];
	private readonly allTasks: Promise<T>[] = [];

	constructor(maxConcurrency: number) {
		this.maxConcurrency = maxConcurrency;
	}

	public addTask(task: () => Promise<T>): void {
		const { promise, resolve, reject } = createPromise<T>();

		this.allTasks.push(promise);

		const run = async () => {
			this.runningCount++;

			try {
				const result = await task();

				resolve(result);
			} catch (e) {
				console.error(e);
				reject(e);
			}

			this.runningCount--;

			await this.runNext();
		};

		if (this.runningCount < this.maxConcurrency) {
			run();
		} else {
			this.taskQueue.push(run);
		}
	}

	private async runNext(): Promise<void> {
		if (this.runningCount >= this.maxConcurrency) return;

		const next = this.taskQueue.shift();

		if (next) {
			await next();
		}
	}

	public async waitAll(): Promise<ReadonlyArray<T>> {
		return await Promise.all(this.allTasks);
	}
}

export default TaskLimiter;
