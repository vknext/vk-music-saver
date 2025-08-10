import { Icon20AdvertisingOutline, Icon20ErrorCircleOutline } from '@vkontakte/icons';
import { Div, Group, Header, Link, MiniInfoCell, Spacing, Text } from '@vkontakte/vkui';
import { IS_FIREFOX } from 'src/common/constants';
import useLang from '../hooks/useLang';
import styles from './InstalledPanel.module.scss';

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
					<li>
						{lang.use('installed_step_1')}{' '}
						<Link href="https://vk.com/audio" target="_blank">
							vk.com/audio
						</Link>
						.
					</li>
					<li>{lang.use('installed_step_2')}</li>
					<li>{lang.use('installed_step_3')}</li>
				</ol>
				<Div>
					<Text>
						{lang.use('installed_reload_notice', {
							site: (
								<Link href="https://vk.com/audio" target="_blank">
									vk.com
								</Link>
							),
						})}
					</Text>
				</Div>
			</Group>
			{IS_FIREFOX && (
				<Group mode="card">
					<Div>
						<Text>
							{lang.use('installed_ffmpeg_notice_1')}
							<br />
							<br />
							{lang.use('installed_ffmpeg_notice_2')}
							<br />
							<br />
							{lang.use('installed_ffmpeg_notice_3', {
								site: (
									<Link href="https://vknext.net" target="_blank">
										vknext.net
									</Link>
								),
							})}
							<br />
							<br />
							{lang.use('installed_ffmpeg_notice_4')}
						</Text>
					</Div>
				</Group>
			)}
			<Group mode="card" header={<Header>{lang.use('installed_attention')}</Header>}>
				<MiniInfoCell textWrap="full" mode="accent" before={<Icon20ErrorCircleOutline />}>
					{lang.use('installed_pc_version_only', {
						site: (
							<Link href="https://vk.com/audio" target="_blank">
								vk.com
							</Link>
						),
					})}
				</MiniInfoCell>
				<MiniInfoCell textWrap="full" mode="accent" before={<Icon20AdvertisingOutline />}>
					{lang.use('installed_follow_community', {
						link: (
							<Link href="https://vk.com/vknext" target="_blank">
								{lang.use('installed_follow_community_link')}
							</Link>
						),
					})}
				</MiniInfoCell>
			</Group>
		</>
	);
};
