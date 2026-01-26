import { Footnote } from '@vkontakte/vkui';
import { useDownloadStore } from 'src/store';
import { useTaskId } from '../context';
import styles from '../DownloadTaskCell.module.scss';

export const TaskExtraText = () => {
	const taskId = useTaskId();

	const extraText = useDownloadStore((state) => state.tasks.get(taskId)?.extraText);

	if (!extraText) return null;

	return <Footnote className={styles.DownloadTaskCell__subtitle}>{extraText}</Footnote>;
};
