import type { OnProgressTrackerCallback, ProgressTrackerStats } from 'src/lib/ProgressTracker';
import { create } from 'zustand';
import type { DownloadType } from './constants';
import { DownloadStatus } from './constants';
import {
	DownloadTaskAlreadyFinishedError,
	DownloadTaskNotFoundError,
	DownloadTaskTimeoutError,
} from './downloadErrors';

interface Progress {
	current?: number;
	total?: number;
}

export interface DownloadTask {
	id: string;
	title: string;
	type: DownloadType;
	progress: Progress;
	stats: ProgressTrackerStats;
	status: DownloadStatus;
	photoUrl?: string;
	extraText?: string;
	/**
	 * Пользователь отменил скачивание
	 */
	onCancel: Set<() => void>;
	/**
	 * Информация о скачивании удалена из менеджера
	 */
	onRemove: Set<() => void>;
	/**
	 * Метод для сохранения скачанного файла из менеджера
	 */
	onSave?: () => void;
	timeoutId?: NodeJS.Timeout;
}

export interface StartDownloadInput extends Pick<DownloadTask, 'id' | 'title' | 'type' | 'photoUrl'> {
	onCancel?: () => void;
}

export interface DownloadTaskFinishProps {
	onSave: () => void;
	onRemove: () => void;
}

interface DownloadTaskHandlers {
	setTitle: (title: string) => void;
	setProgress: (progress: Progress) => void;
	setStats: OnProgressTrackerCallback;
	setPhotoUrl: (photoUrl: string) => void;
	/**
	 * Отображается после "title", но над прогрессом
	 */
	setExtraText: (text: string) => void;
	/**
	 * Скачивание завершено
	 */
	finish: (callbacks?: DownloadTaskFinishProps) => void;
	/**
	 * Скачивание отменено из менеджера или по внешней причине (например плейлист пустой)
	 */
	cancel: () => void;
	/**
	 * Удаление из менеджера по кнопке или по таймеру
	 */
	remove: () => void;
}

interface DownloadStore {
	tasks: Map<string, DownloadTask>;
	startDownload: (input: StartDownloadInput) => { id: string } & DownloadTaskHandlers;
	getTask: (id: string) => Omit<DownloadTask, 'onCancel' | 'timeoutId'> | undefined;
	getTaskHandlersById: (id: string) => DownloadTaskHandlers;
	getActiveTasksCount: () => number;
}

export const useDownloadStore = create<DownloadStore>((set, get) => {
	const getTaskById = (id: string) => {
		const tasks = new Map(get().tasks);
		const task = tasks.get(id);

		if (!task) {
			throw new DownloadTaskNotFoundError(id);
		}

		return task;
	};

	const setProgressById = (id: string, progress: Progress) => {
		const task = getTaskById(id);

		const tasks = new Map(get().tasks);

		if (task.status === DownloadStatus.FINISHED) {
			throw new DownloadTaskAlreadyFinishedError(id);
		}

		set(() => {
			tasks.set(id, { ...task, progress, status: DownloadStatus.DOWNLOADING });

			return { tasks };
		});
	};

	const setStatsById = (id: string, stats: ProgressTrackerStats) => {
		const task = getTaskById(id);

		const tasks = new Map(get().tasks);

		if (task.status === DownloadStatus.FINISHED) {
			throw new DownloadTaskAlreadyFinishedError(id);
		}

		set(() => {
			tasks.set(id, { ...task, stats });

			return { tasks };
		});
	};

	const setTitleById = (id: string, title: string) => {
		const task = getTaskById(id);

		set((state) => {
			const tasks = new Map(state.tasks);

			tasks.set(id, {
				...task,
				title,
			});

			return { tasks };
		});
	};

	const finishTaskById = (id: string, callbacks?: DownloadTaskFinishProps) => {
		const task = getTaskById(id);

		if (task.status === DownloadStatus.FINISHED) {
			throw new DownloadTaskAlreadyFinishedError(id);
		}

		if (task.timeoutId) {
			throw new DownloadTaskTimeoutError(id);
		}

		// если скачивание напрямую в папку - 5 минут, иначе 15
		const ms = (callbacks?.onSave ? 15 : 5) * 60 * 1000;
		const timeoutId = setTimeout(() => removeDownloadById(id), ms);

		set((state) => {
			const tasks = new Map(state.tasks);

			const onRemove = new Set(task.onRemove);

			if (callbacks?.onRemove) {
				onRemove.add(callbacks.onRemove);
			}

			tasks.set(id, { ...task, onRemove, timeoutId, onSave: callbacks?.onSave, status: DownloadStatus.FINISHED });

			return { tasks };
		});
	};

	const cancelDownloadById = (id: string) => {
		const task = getTaskById(id);

		for (const onCancel of task.onCancel) {
			onCancel();
		}

		set((state) => {
			const tasks = new Map(state.tasks);

			tasks.delete(id);

			return { tasks };
		});
	};

	const removeDownloadById = (id: string) => {
		set((state) => {
			const tasks = new Map(state.tasks);

			const task = tasks.get(id);

			if (task?.onRemove) {
				for (const onRemove of task.onRemove) {
					onRemove();
				}
			}

			tasks.delete(id);

			return { tasks };
		});
	};

	const setPhotoUrlById = (id: string, photoUrl: string) => {
		const task = getTaskById(id);

		set((state) => {
			const tasks = new Map(state.tasks);

			tasks.set(id, { ...task, photoUrl });

			return { tasks };
		});
	};

	const setExtraTextById = (id: string, text: string) => {
		const task = getTaskById(id);

		set((state) => {
			const tasks = new Map(state.tasks);

			tasks.set(id, { ...task, extraText: text });

			return { tasks };
		});
	};

	const getTaskHandlersById = (id: string): DownloadTaskHandlers => {
		return {
			setExtraText: (text) => setExtraTextById(id, text),
			setPhotoUrl: (photoUrl) => setPhotoUrlById(id, photoUrl),
			setTitle: (title) => setTitleById(id, title),
			setProgress: (progress) => setProgressById(id, progress),
			setStats: (stats) => setStatsById(id, stats),
			finish: (callbacks) => finishTaskById(id, callbacks),
			cancel: () => cancelDownloadById(id),
			remove: () => removeDownloadById(id),
		};
	};

	return {
		tasks: new Map(),

		startDownload: ({ id, onCancel, ...props }: StartDownloadInput) => {
			const newTask: DownloadTask = {
				...props,
				id,
				progress: { current: undefined, total: undefined },
				stats: { loaded: 0, total: undefined, speed: 0, eta: undefined },
				status: DownloadStatus.PREPARING,
				onCancel: new Set(onCancel ? [onCancel] : []),
				onRemove: new Set(),
			};

			set((state) => {
				const tasks = new Map(state.tasks);

				tasks.set(id, newTask);

				return { tasks };
			});

			const handlers = getTaskHandlersById(id);

			return { id, ...handlers };
		},

		getTask: (id) => {
			const task = getTaskById(id);

			return task ? { ...task } : undefined;
		},

		getTaskHandlersById,

		getActiveTasksCount: () => {
			const tasks = get().tasks.values();
			const activeTasks = Array.from(tasks).filter((task) => task.status !== DownloadStatus.FINISHED);

			return activeTasks.length;
		},
	};
});
