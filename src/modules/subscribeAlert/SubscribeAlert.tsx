import { Alert } from '@vkontakte/vkui';

interface SubscribeAlertProps {
	onDestroy: () => void;
	onButtonClick: () => void;
}

export const SubscribeAlert = ({ onDestroy, onButtonClick }: SubscribeAlertProps) => {
	return (
		<Alert
			onClose={onDestroy}
			title="Пропала кнопка скачивания треков или плейлистов?"
			description="Скорее всего, это из-за очередного обновления сайта. Подпишитесь на нашу группу, чтобы сразу узнавать о таких изменениях и обновлениях расширения."
			actionsLayout="vertical"
			actions={[
				{
					title: 'Подписаться',
					mode: 'cancel',
					action: () => {
						try {
							window.vkApi.api('wall.subscribe', {
								owner_id: -207165415,
							});
						} catch (error) {
							console.error(error);
						}

						onButtonClick();
					},
				},
				{
					title: 'Нет, спасибо',
					mode: 'default',
					action: onButtonClick,
				},
			]}
		/>
	);
};
