import { Button, Div, Link, ModalPage, ModalPageHeader, Spacing, Text } from '@vkontakte/vkui';
import { useEffect, useState } from 'react';
import cancelEvent from 'src/lib/cancelEvent';
import { VMP_IMAGE_1, VMP_URL } from '../constants';
import styles from './VMPOnboarding.module.scss';

interface VMPOnboardingProps {
	onClosed: () => void;
}

/**
 * @see vknext
 */
const VMPOnboarding = ({ onClosed }: VMPOnboardingProps) => {
	const [open, setOpen] = useState(false);

	const onInstall: React.MouseEventHandler<HTMLElement> = (event) => {
		cancelEvent(event);

		window.open(VMP_URL, '_blank');

		onClosed();
	};

	useEffect(() => {
		setOpen(true);
	}, []);

	return (
		<ModalPage
			size={550}
			nav="vms_vmp_onboarding"
			open={open}
			dynamicContentHeight
			noFocusToDialog
			onClose={() => setOpen(false)}
			header={<ModalPageHeader noSeparator>Попробуйте VK Music Player</ModalPageHeader>}
			onClosed={onClosed}
			footer={
				<Div>
					<Button href={VMP_URL} target="_blank" onClick={onInstall} stretched size="m">
						Установить
					</Button>
				</Div>
			}
		>
			<Div style={{ paddingBottom: 0 }}>
				<div className={styles.imageWrapper}>
					<img src={VMP_IMAGE_1} alt="" className={styles.image} />
				</div>
				<Spacing size={12} />
				<Text className={styles.text}>
					<b>
						VK Music Player — это бесплатное расширение, которое позволяет слушать VK Музыку, не открывая
						вкладку с ВКонтакте.
					</b>
					<br />
					<br />
					<b>🎵 Полноценный музыкальный каталог:</b>
					<ul className={styles.list}>
						<li>
							Расширение предоставляет полный функционал сервиса VK Музыка vk.ru/audio прямо в вашем
							браузере.
						</li>
						<li>Все ваши плейлисты, рекомендации и музыкальные коллекции всегда будут под рукой!</li>
					</ul>
					<br />
					<b>🎨 Выбор плеера под себя:</b>
					<ul className={styles.list}>
						<li>Расширенный</li>
						<li>Как на vk.ru</li>
					</ul>
					<br />
					<b>⭐️ Возможности:</b>
					<ul className={styles.list}>
						<li>Прослушивание музыки бесплатно и без рекламы.</li>
						<li>
							Скробблинг и «сейчас играет» в{' '}
							<Link href="https://www.last.fm" target="_blank">
								last.fm
							</Link>
							.
						</li>
						<li>Тексты песен из Genius.</li>
						<li>Автоматический пропуск дизлайкнутых треков.</li>
						<li>Блокировка артистов — треки из чёрного списка не будут проигрываться.</li>
						<li>Глобальные горячие клавиши.</li>
					</ul>
				</Text>
			</Div>
		</ModalPage>
	);
};

export default VMPOnboarding;
