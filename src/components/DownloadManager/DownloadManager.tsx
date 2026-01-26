import { Icon28LogoMiniVkMusicSaverColor } from '@vknext/icons';
import { classNames, Header } from '@vkontakte/vkui';
import { useState } from 'react';
import PopoverReforged from 'src/components/PopoverReforged/PopoverReforged';
import useLang from 'src/hooks/useLang';
import { useDownloadStore } from 'src/store';
import { DownloadStatus } from 'src/store/constants';
import { useShallow } from 'zustand/react/shallow';
import styles from './DownloadManager.module.scss';
import DownloadTaskCell from './DownloadTaskCell/DownloadTaskCell';

const DownloadManager = () => {
	const lang = useLang();
	const [isShown, setIsShown] = useState(true);

	const activeTasksIds = useDownloadStore(
		useShallow((state) => {
			const tasks = Array.from(state.tasks.values());

			return tasks
				.filter((task) => task.status === DownloadStatus.FINISHED)
				.map((task) => task.id)
				.reverse();
		})
	);

	const finishedTasksIds = useDownloadStore(
		useShallow((state) => {
			const tasks = Array.from(state.tasks.values());

			return tasks
				.filter((task) => task.status !== DownloadStatus.FINISHED)
				.map((task) => task.id)
				.reverse();
		})
	);

	const isDisabled = activeTasksIds.length === 0 && finishedTasksIds.length === 0;

	if (isDisabled) {
		return null;
	}

	return (
		<PopoverReforged
			content={
				<>
					{activeTasksIds.length > 0 && (
						<>
							<Header size="m" indicator={activeTasksIds.length}>
								{lang.use('vms_download_manager_active_tasks')}
							</Header>
							{activeTasksIds.map((taskId) => (
								<DownloadTaskCell key={taskId} taskId={taskId} />
							))}
						</>
					)}
					{finishedTasksIds.length > 0 && (
						<>
							<Header size="m" indicator={finishedTasksIds.length}>
								{lang.use('vms_download_manager_finished_tasks')}
							</Header>
							{finishedTasksIds.map((taskId) => (
								<DownloadTaskCell key={taskId} taskId={taskId} />
							))}
						</>
					)}
				</>
			}
			className={styles.DownloadManager}
			offsetByMainAxis={0}
			placement="bottom-end"
			shown={isShown}
			onShownChange={setIsShown}
		>
			<a className={classNames('TopNavBtn', isShown && 'active')}>
				<div className="TopNavBtn__inner">
					<div className="TopNavBtn__icon">
						<Icon28LogoMiniVkMusicSaverColor width={24} height={24} />
					</div>
				</div>
			</a>
		</PopoverReforged>
	);
};

export default DownloadManager;
