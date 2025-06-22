import { useDownloadStore, type StartDownloadInput } from './useDownloadStore';

export { DownloadStatus, DownloadType } from './constants';
export { type DownloadTask } from './useDownloadStore';

export const startDownload = (input: StartDownloadInput) => useDownloadStore.getState().startDownload(input);
export const getDownloadTaskById = (id: string) => useDownloadStore.getState().getTask(id);

export const useDownloadTasks = () => useDownloadStore((state) => state.tasks);
export const useDownloadTaskHandlers = (id: string) => useDownloadStore((state) => state.getTaskHandlersById)(id);

if (process.env.NODE_ENV === 'development') {
	useDownloadStore.subscribe((state) => console.info('[VMS/store] updated', state));
}
