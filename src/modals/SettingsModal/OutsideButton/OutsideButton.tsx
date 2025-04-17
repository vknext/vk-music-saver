import { useCustomModalControl } from '@vknext/shared/components/CustomModalPage/CustomModalPageContext';
import { noop } from '@vknext/shared/utils/noop';
import { Icon20FavoriteOutline, Icon20More, Icon20ShareOutline } from '@vkontakte/icons';
import { InfoRow, Link, ModalOutsideButton } from '@vkontakte/vkui';
import {
	CHROME_REVIEW_URL,
	FIREFOX_REVIEW_URL,
	IS_FIREFOX,
	VKNEXT_GROUP_DOMAIN,
	VKNEXT_SITE_URL,
} from 'src/common/constants';
import { ActionsMenuAction, ActionsMenuPopover, ActionsMenuSeparator } from 'src/components/ActionsMenu';
import cancelEvent from 'src/lib/cancelEvent';
import useLang from 'src/react/hooks/useLang';
import showSnackbar from 'src/react/showSnackbar';
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
						leftIcon={<Icon20ShareOutline />}
						onClick={onShare}
					>
						{lang.use('vms_share')}
					</ActionsMenuAction>
					<ActionsMenuSeparator />
					<div className={styles.Div}>
						<InfoRow header={lang.use('vms_creator')}>
							<Link href="https://vk.com/vknext" className={styles.Link} onClick={onCreatorClick}>
								VK Next
							</Link>
						</InfoRow>
					</div>
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
