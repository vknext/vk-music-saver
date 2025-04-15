import { Icon24Cancel, Icon24DeleteOutline, Icon24DownloadOutline } from '@vkontakte/icons';
import { Avatar, Flex, Footnote, Headline, IconButton, Image, Progress, Subhead, Tooltip } from '@vkontakte/vkui';
import normalizeProgressValue from 'src/lib/normalizeProgressValue';
import useLang from 'src/react/hooks/useLang';
import { DownloadStatus, DownloadType, useDownloadTaskHandlers, type DownloadTask } from 'src/store';
import styles from './DownloadTaskCell.module.scss';
import FallbackIcon from './FallbackIcon';

interface DownloadTaskCellProps {
	task: DownloadTask;
}

const DownloadTaskCell = ({ task }: DownloadTaskCellProps) => {
	const lang = useLang();
	const { cancel, remove } = useDownloadTaskHandlers(task.id);

	const { progress, status, photoUrl } = task;

	const isShownProgress = (() => {
		if (task.type === DownloadType.TRACK && progress.current) {
			return true;
		}

		return !!progress.current && !!progress.total;
	})();

	const isPreparing = status === DownloadStatus.PREPARING;
	const isDownloading = status === DownloadStatus.DOWNLOADING;
	const isArchiving = status === DownloadStatus.ARCHIVING;
	const isFinished = status === DownloadStatus.FINISHED;

	return (
		<div className={styles.DownloadTaskCell}>
			<div className={styles.DownloadTaskCell__before}>
				{task.type === DownloadType.CONVO ? (
					<Avatar size={48} src={photoUrl} fallbackIcon={<FallbackIcon type={task.type} />} />
				) : (
					<Image size={48} src={photoUrl} fallbackIcon={<FallbackIcon type={task.type} />} />
				)}
			</div>
			<div className={styles.DownloadTaskCell__middle}>
				<Headline className={styles.DownloadTaskCell__children} Component="span" weight="3">
					{task.title}
				</Headline>
				{(isPreparing || (isDownloading && !isShownProgress)) && (
					<Footnote normalize={false} className={styles.DownloadTaskCell__subtitle}>
						{lang.use('vms_downloading')}
					</Footnote>
				)}
				{isArchiving && (
					<Footnote normalize={false} className={styles.DownloadTaskCell__subtitle}>
						{lang.use('vms_archivation')}
					</Footnote>
				)}
				{isDownloading && isShownProgress && (
					<Flex align="center" gap={12} className={styles.DownloadTaskCellProgress}>
						{progress.current && progress.total && (
							<Progress
								className={styles.DownloadTaskCellProgress__progress}
								value={normalizeProgressValue(progress.current, 0, progress.total)}
							/>
						)}
						<Subhead className={styles.DownloadTaskCellProgress__label}>
							{progress.current && progress.total
								? `${progress.current}/${progress.total}`
								: progress.current}
							{task.type === DownloadType.TRACK ? '%' : ''}
						</Subhead>
					</Flex>
				)}
			</div>
			<div className={styles.DownloadTaskCell__after}>
				{isFinished && (
					<>
						{task.onSave && (
							<Tooltip
								usePortal={document.body}
								disableTriggerOnFocus
								placement="top"
								description={lang.use('vms_download_manager_save')}
							>
								<IconButton onClick={task.onSave} aria-label={lang.use('vms_download_manager_save')}>
									<Icon24DownloadOutline />
								</IconButton>
							</Tooltip>
						)}
						<Tooltip
							usePortal={document.body}
							disableTriggerOnFocus
							placement="top"
							description={lang.use('vms_download_manager_remove')}
						>
							<IconButton onClick={remove} aria-label={lang.use('vms_download_manager_remove')}>
								<Icon24DeleteOutline color="var(--vkui--color_icon_negative)" />
							</IconButton>
						</Tooltip>
					</>
				)}
				{!isFinished && (
					<Tooltip
						usePortal={document.body}
						disableTriggerOnFocus
						placement="top"
						description={lang.use('vms_download_manager_cancel')}
					>
						<IconButton onClick={cancel} aria-label={lang.use('vms_download_manager_cancel')}>
							<Icon24Cancel color="var(--vkui--color_icon_secondary)" />
						</IconButton>
					</Tooltip>
				)}
			</div>
		</div>
	);
};

export default DownloadTaskCell;
