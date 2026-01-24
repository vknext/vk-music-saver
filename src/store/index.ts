import { useDownloadStore, type StartDownloadInput } from './useDownloadStore';

export { DownloadStatus, DownloadType } from './constants';
export { type DownloadTask } from './useDownloadStore';

export const startDownload = (input: StartDownloadInput) => useDownloadStore.getState().startDownload(input);
export const getDownloadTaskById = (id: string) => useDownloadStore.getState().getTask(id);
export const getDownloadActiveTasksCount = () => useDownloadStore.getState().getActiveTasksCount();

export const useDownloadTasks = () => useDownloadStore((state) => state.tasks);
export const useDownloadTaskHandlers = (id: string) => useDownloadStore((state) => state.getTaskHandlersById)(id);

if (process.env.NODE_ENV === 'development') {
	useDownloadStore.subscribe((state) => console.info('[VK Music Saver/store] updated', state));
}
