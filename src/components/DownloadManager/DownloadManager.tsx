import { Icon28LogoMiniVkMusicSaverColor } from '@vknext/icons';
import { classNames, Header } from '@vkontakte/vkui';
import { useState } from 'react';
import useLang from 'src/hooks/useLang';
import { useDownloadTasks } from 'src/store';
import { DownloadStatus } from 'src/store/constants';
import PopoverReforged from 'src/components/PopoverReforged/PopoverReforged';
import styles from './DownloadManager.module.scss';
import DownloadTaskCell from './DownloadTaskCell/DownloadTaskCell';

const DownloadManager = () => {
	const lang = useLang();
	const [isShown, setIsShown] = useState(true);
	const tasks = useDownloadTasks();

	const activeTasks = Array.from(tasks.values())
		.filter((task) => task.status !== DownloadStatus.FINISHED)
		.reverse();

	const finishedTasks = Array.from(tasks.values())
		.filter((task) => task.status === DownloadStatus.FINISHED)
		.reverse();

	const isDisabled = activeTasks.length === 0 && finishedTasks.length === 0;

	if (isDisabled) {
		return null;
	}

	return (
		<PopoverReforged
			content={
				<>
					{activeTasks.length > 0 && (
						<>
							<Header size="m" indicator={activeTasks.length}>
								{lang.use('vms_download_manager_active_tasks')}
							</Header>
							{activeTasks.map((task) => (
								<DownloadTaskCell key={task.id} task={task} />
							))}
						</>
					)}
					{finishedTasks.length > 0 && (
						<>
							<Header size="m" indicator={finishedTasks.length}>
								{lang.use('vms_download_manager_finished_tasks')}
							</Header>
							{finishedTasks.map((task) => (
								<DownloadTaskCell key={task.id} task={task} />
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
