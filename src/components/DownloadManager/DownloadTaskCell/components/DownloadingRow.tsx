import { Footnote } from '@vkontakte/vkui';
import useLang from 'src/hooks/useLang';
import { DownloadStatus, useDownloadStore } from 'src/store';
import { useTaskId } from '../context';
import styles from '../DownloadTaskCell.module.scss';
import { useIsShownProgress } from '../hooks';

export const TaskDownloadingRow = () => {
	const lang = useLang();
	const taskId = useTaskId();

	const isPreparing = useDownloadStore((state) => state.tasks.get(taskId)?.status === DownloadStatus.PREPARING);
	const isFinished = useDownloadStore((state) => state.tasks.get(taskId)?.status === DownloadStatus.FINISHED);

	const isShownProgress = useIsShownProgress();

	if (isFinished) return null;

	if (isPreparing || !isShownProgress) {
		return (
			<Footnote normalize={false} className={styles.DownloadTaskCell__subtitle}>
				{lang.use('vms_downloading')}
			</Footnote>
		);
	}

	return null;
};
