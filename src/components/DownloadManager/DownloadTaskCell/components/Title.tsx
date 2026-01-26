import { Headline } from '@vkontakte/vkui';
import { useDownloadStore } from 'src/store';
import styles from '../DownloadTaskCell.module.scss';
import { useTaskId } from '../context';

export const TaskTitle = () => {
	const taskId = useTaskId();
	const title = useDownloadStore((state) => state.tasks.get(taskId)?.title);

	return (
		<Headline className={styles.DownloadTaskCell__children} Component="span" weight="3">
			{title}
		</Headline>
	);
};
