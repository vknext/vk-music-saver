import { Avatar, Image } from '@vkontakte/vkui';
import { DownloadType, useDownloadStore } from 'src/store';
import FallbackIcon from './FallbackIcon';
import { useTaskId } from '../context';

export const Before = () => {
	const taskId = useTaskId();

	const taskType = useDownloadStore((state) => state.tasks.get(taskId)?.type);
	const photoUrl = useDownloadStore((state) => state.tasks.get(taskId)?.photoUrl);

	if (!taskType) return null;

	if (taskType === DownloadType.CONVO) {
		return <Avatar size={48} src={photoUrl} fallbackIcon={<FallbackIcon type={taskType} />} />;
	}

	return <Image size={48} src={photoUrl} fallbackIcon={<FallbackIcon type={taskType} />} />;
};
