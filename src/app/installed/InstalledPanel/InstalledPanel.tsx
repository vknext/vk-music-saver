import { Icon20AdvertisingOutline, Icon20ErrorCircleOutline } from '@vkontakte/icons';
import { Div, Group, Header, Link, MiniInfoCell, Spacing, Text } from '@vkontakte/vkui';
import useLang from '../hooks/useLang';
import styles from './InstalledPanel.module.scss';

const siteValues = {
	vkRu: (
		<Link href="https://vk.ru" target="_blank">
			vk.ru
		</Link>
	),
	vkCom: (
		<Link href="https://vk.com" target="_blank">
			vk.com
		</Link>
	),
	vkRuAudio: (
		<Link href="https://vk.ru/audio" target="_blank">
			vk.ru/audio
		</Link>
	),
	vkComAudio: (
		<Link href="https://vk.com/audio" target="_blank">
			vk.com/audio
		</Link>
	),
	mobileVkRu: 'm.vk.ru',
	mobileVkCom: 'm.vk.com',
	vkRuVkNext: (
		<Link href="https://vk.ru/vknext" target="_blank">
			vk.ru/vknext
		</Link>
	),
	vknextNet: (
		<Link href="https://vknext.net" target="_blank">
			vknext.net
		</Link>
	),
};

export const InstalledPanel = () => {
	const lang = useLang();

	return (
		<>
			<Spacing size={16} />
			<Group mode="card">
				<Div>
					<Text>{lang.use('installed_how_title')}</Text>
				</Div>
				<ol className={styles.InstallGuide}>
					<li>{lang.use('installed_step_1', siteValues)}</li>
					<li>{lang.use('installed_step_2')}</li>
					<li>{lang.use('installed_step_3')}</li>
				</ol>
				<Div>
					<Text>{lang.use('installed_reload_notice', siteValues)}</Text>
				</Div>
			</Group>
			<Group mode="card">
				<Div>
					<Text>
						{lang.use('installed_convert_method_notice_1')}
						<br />
						<br />
						{lang.use('installed_convert_method_notice_2')}
						<br />
						<br />
						{lang.use('installed_convert_method_notice_3')}
						<br />
						<br />
						{lang.use('installed_convert_method_notice_4')}
					</Text>
				</Div>
			</Group>
			<Group mode="card" header={<Header>{lang.use('installed_attention')}</Header>}>
				<MiniInfoCell textWrap="full" mode="accent" before={<Icon20ErrorCircleOutline />}>
					{lang.use('installed_pc_version_only', siteValues)}
				</MiniInfoCell>
				<MiniInfoCell textWrap="full" mode="accent" before={<Icon20AdvertisingOutline />}>
					{lang.use('installed_follow_community', siteValues)}
				</MiniInfoCell>
			</Group>
		</>
	);
};
