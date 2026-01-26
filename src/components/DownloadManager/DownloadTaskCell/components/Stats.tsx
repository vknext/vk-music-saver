import { Footnote } from '@vkontakte/vkui';
import useLang from 'src/hooks/useLang';
import humanFileSize from 'src/lib/humanFileSize';
import { DownloadStatus, useDownloadStore } from 'src/store';
import { useTaskId } from '../context';
import styles from '../DownloadTaskCell.module.scss';

export const TaskStats = () => {
	const lang = useLang();
	const taskId = useTaskId();

	const stats = useDownloadStore((state) => {
		const task = state.tasks.get(taskId);
		if (!task) return null;

		return task.stats;
	});

	const isFinished = useDownloadStore((state) => state.tasks.get(taskId)?.status === DownloadStatus.FINISHED);

	if (!stats) return null;

	const sizeUnits = lang.use('vms_size_units', null, 'raw') as unknown as string[];

	const { loaded, total, speed, eta } = stats;

	const effectiveTotal = total && total >= loaded ? total : loaded;

	const loadedHuman = humanFileSize(loaded, { decimals: 2, units: sizeUnits });
	const totalHuman = humanFileSize(effectiveTotal, { decimals: 2, units: sizeUnits });
	const speedHuman = humanFileSize(speed, { decimals: 2, units: sizeUnits });

	const getStatusText = () => {
		if (isFinished) return loadedHuman;

		let etaText = '';
		const hasValidEta = typeof eta === 'number' && eta >= 0;

		if (hasValidEta) {
			etaText = eta < 3 ? lang.use('vms_eta_almost_done') : lang.use('vms_seconds_plurals', eta);
		}

		const isTotalValid = total !== undefined && total >= loaded;

		if (hasValidEta && isTotalValid) {
			return lang.use('vms_download_manager_progress_full', {
				total: totalHuman,
				loaded: loadedHuman,
				speed: speedHuman,
				eta: etaText,
			});
		}

		return lang.use('vms_download_manager_progress_basic', {
			total: totalHuman,
			loaded: loadedHuman,
			speed: speedHuman,
		});
	};

	return (
		<Footnote normalize={false} className={styles.DownloadTaskCell__subtitle}>
			{getStatusText()}
		</Footnote>
	);
};
