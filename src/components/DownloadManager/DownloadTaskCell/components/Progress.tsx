import { Flex, Progress, Subhead } from '@vkontakte/vkui';
import normalizeProgressValue from 'src/lib/normalizeProgressValue';
import { DownloadType, useDownloadStore } from 'src/store';
import { useTaskId } from '../context';
import styles from '../DownloadTaskCell.module.scss';
import { useIsShownProgress } from '../hooks';

export const TaskProgress = () => {
	const taskId = useTaskId();

	const isTrack = useDownloadStore((state) => state.tasks.get(taskId)?.type === DownloadType.TRACK);

	const isShownProgress = useIsShownProgress();

	const current = useDownloadStore((state) => state.tasks.get(taskId)?.progress.current);
	const total = useDownloadStore((state) => state.tasks.get(taskId)?.progress.total);

	if (!isShownProgress) return null;

	return (
		<Flex align="center" gap={[0, 12]} className={styles.DownloadTaskCellProgress}>
			{current && total && (
				<Progress
					className={styles.DownloadTaskCellProgress__progress}
					value={normalizeProgressValue(current, 0, total)}
				/>
			)}
			<Subhead className={styles.DownloadTaskCellProgress__label}>
				{current && total ? `${current}/${total}` : current}
				{isTrack ? '%' : ''}
			</Subhead>
		</Flex>
	);
};
