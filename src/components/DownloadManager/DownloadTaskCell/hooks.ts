import { DownloadStatus, useDownloadStore } from 'src/store';
import { useTaskId } from './context';

export const useIsShownProgress = () => {
	const taskId = useTaskId();

	const isShownProgress = useDownloadStore((state) => {
		const task = state.tasks.get(taskId);
		if (!task) return false;

		if (task.status !== DownloadStatus.DOWNLOADING) return false;

		return !!task.progress.current && !!task.progress.total;
	});

	return isShownProgress;
};
