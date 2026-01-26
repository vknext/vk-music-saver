import { Icon24Cancel, Icon24DeleteOutline, Icon24DownloadOutline } from '@vkontakte/icons';
import { IconButton, Tooltip } from '@vkontakte/vkui';
import useLang from 'src/hooks/useLang';
import { DownloadStatus, useDownloadStore, useDownloadTaskHandlers } from 'src/store';
import { useTaskId } from '../context';

export const After = () => {
	const taskId = useTaskId();

	const lang = useLang();

	const isFinished = useDownloadStore((state) => state.tasks.get(taskId)?.status === DownloadStatus.FINISHED);
	const onSave = useDownloadStore((state) => state.tasks.get(taskId)?.onSave);

	const { cancel, remove } = useDownloadTaskHandlers(taskId);

	return (
		<>
			{isFinished && (
				<>
					{onSave && (
						<Tooltip
							usePortal={document.body}
							disableTriggerOnFocus
							placement="top"
							description={lang.use('vms_download_manager_save')}
						>
							<IconButton onClick={onSave} aria-label={lang.use('vms_download_manager_save')}>
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
		</>
	);
};
