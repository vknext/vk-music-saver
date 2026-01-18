import { Icon28LogoMiniVknextColor } from '@vknext/icons';
import { useCustomModalControl } from '@vknext/shared/components/CustomModalPage/CustomModalPageContext';
import { noop } from '@vknext/shared/utils/noop';
import {
	Icon20ClearDataOutline,
	Icon20DonateOutline,
	Icon20FavoriteOutline,
	Icon20More,
	Icon20MusicNoteWaveOutline,
	Icon20ShareOutline,
} from '@vkontakte/icons';
import { Link, ModalOutsideButton } from '@vkontakte/vkui';
import {
	CHROME_REVIEW_URL,
	FIREFOX_REVIEW_URL,
	IS_FIREFOX,
	VKNEXT_DONUT_URL,
	VKNEXT_GROUP_DOMAIN,
	VKNEXT_SITE_URL,
} from 'src/common/constants';
import { ActionsMenuAction, ActionsMenuPopover, ActionsMenuSeparator } from 'src/components/ActionsMenu';
import useLang from 'src/hooks/useLang';
import cancelEvent from 'src/lib/cancelEvent';
import showSnackbar from 'src/react/showSnackbar';
import GlobalStorage from 'src/storages/GlobalStorage';
import TrackDetailsStorage from 'src/storages/TrackDetailsStorage';
import styles from './OutsideButton.module.scss';

const OutsideButton = () => {
	const { closeModal } = useCustomModalControl();
	const lang = useLang();

	const onShare: React.MouseEventHandler<HTMLElement> = async () => {
		const shareData = { url: VKNEXT_SITE_URL } satisfies ShareData;

		if (window.navigator.share && window.navigator.canShare(shareData)) {
			await window.navigator.share(shareData);
		} else {
			await navigator.clipboard.writeText(shareData.url);

			await showSnackbar({ type: 'done', text: lang.use('vms_link_copied') });
		}
	};

	const onCreatorClick: React.MouseEventHandler<HTMLElement> = (event) => {
		cancelEvent(event);

		if (location.pathname.startsWith(`/${VKNEXT_GROUP_DOMAIN}`)) {
			showSnackbar({ type: 'done', text: lang.use('vms_link_copied') });
			return;
		}

		if (window.nav) {
			window.nav.go(VKNEXT_GROUP_DOMAIN);
			closeModal();
		}
	};

	const onClearStorage: React.MouseEventHandler<HTMLElement> = async (event) => {
		cancelEvent(event);

		await GlobalStorage.clearDatabase();

		window.location.reload();
	};

	const onClearTrackDetailsStorage: React.MouseEventHandler<HTMLElement> = async (event) => {
		cancelEvent(event);

		await TrackDetailsStorage.clearDatabase();

		window.location.reload();
	};

	return (
		<ActionsMenuPopover
			trigger="hover"
			placement="bottom-end"
			offsetByMainAxis={0}
			className={styles.Popover}
			actions={
				<>
					<ActionsMenuAction
						type="primary"
						size="large"
						multiline
						leftIcon={<Icon20FavoriteOutline />}
						href={IS_FIREFOX ? FIREFOX_REVIEW_URL : CHROME_REVIEW_URL}
						target="_blank"
					>
						{lang.use(IS_FIREFOX ? 'vms_settings_review_in_firefox' : 'vms_settings_review_in_chrome')}
					</ActionsMenuAction>
					<ActionsMenuAction
						type="primary"
						size="large"
						multiline
						leftIcon={<Icon20DonateOutline />}
						href={VKNEXT_DONUT_URL}
						target="_blank"
					>
						{lang.use('vms_settings_donate')}
					</ActionsMenuAction>
					<ActionsMenuAction
						type="primary"
						size="large"
						multiline
						leftIcon={<Icon20ShareOutline />}
						onClick={onShare}
					>
						{lang.use('vms_share')}
					</ActionsMenuAction>
					<ActionsMenuSeparator />
					<ActionsMenuAction
						type="danger"
						size="large"
						multiline
						leftIcon={<Icon20ClearDataOutline />}
						onClick={onClearStorage}
					>
						{lang.use('vms_clear_storage')}
					</ActionsMenuAction>
					<ActionsMenuAction
						type="danger"
						size="large"
						multiline
						leftIcon={<Icon20MusicNoteWaveOutline />}
						onClick={onClearTrackDetailsStorage}
						subtitle={lang.use('vms_clear_track_details_storage_description')}
					>
						{lang.use('vms_clear_track_details_storage')}
					</ActionsMenuAction>
					<ActionsMenuSeparator />
					<ActionsMenuAction
						type="secondary"
						size="large"
						leftIcon={<Icon28LogoMiniVknextColor width={20} height={20} />}
						multiline
						hasHover={false}
					>
						{lang.use('vms_created_by', {
							name: (
								<Link href="https://vk.ru/vknext" className={styles.Link} onClick={onCreatorClick}>
									VK Next
								</Link>
							),
						})}
					</ActionsMenuAction>
				</>
			}
		>
			<ModalOutsideButton onClick={noop}>
				<Icon20More />
			</ModalOutsideButton>
		</ActionsMenuPopover>
	);
};

export default OutsideButton;
