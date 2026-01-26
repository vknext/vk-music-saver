import { memo } from 'react';
import { After } from './components/After';
import { Before } from './components/Before';
import { TaskIdProvider } from './context';
import { TaskDownloadingRow } from './components/DownloadingRow';
import styles from './DownloadTaskCell.module.scss';
import { TaskExtraText } from './components/ExtraText';
import { TaskProgress } from './components/Progress';
import { TaskStats } from './components/Stats';
import { TaskTitle } from './components/Title';

interface DownloadTaskCellProps {
	taskId: string;
}

const DownloadTaskCell = memo(({ taskId }: DownloadTaskCellProps) => {
	return (
		<TaskIdProvider value={taskId}>
			<div className={styles.DownloadTaskCell}>
				<div className={styles.DownloadTaskCell__before}>
					<Before />
				</div>
				<div className={styles.DownloadTaskCell__middle}>
					<TaskTitle />
					<TaskExtraText />
					<TaskDownloadingRow />
					<TaskProgress />
					<TaskStats />
				</div>
				<div className={styles.DownloadTaskCell__after}>
					<After />
				</div>
			</div>
		</TaskIdProvider>
	);
});

export default DownloadTaskCell;
