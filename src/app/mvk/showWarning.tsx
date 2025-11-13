import { IconLogoVkMusicSaverColorWithText38h } from '@vknext/icons';
import { waitHTMLBody } from '@vknext/shared/utils/waitHTMLBody';
import { Button, Checkbox, FormItem, ModalPage, ModalPageHeader, Placeholder } from '@vkontakte/vkui';
import { useEffect, useState } from 'react';
import useLang from 'src/hooks/useLang';
import initReactApp from 'src/react/initReactApp';
import { MVK_WARNING_STORAGE_KEY } from './constants';

interface AlertErrorProps {
	onClosed?: () => void;
}

const getFVLink = (): string | null => {
	const navFvLink = window.nav.fv_link;

	if (navFvLink) {
		return navFvLink;
	}

	const desktopVersion = document.querySelector('#l_menu_desktop_version [href]');
	if (!desktopVersion) return null;

	return desktopVersion.getAttribute('href');
};

const HideWarningFormItem = () => {
	const [isHidden, setIsHidden] = useState(localStorage.getItem(MVK_WARNING_STORAGE_KEY) === 'true');
	const lang = useLang();

	const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
		const isHidden = e.target.checked;

		localStorage.setItem(MVK_WARNING_STORAGE_KEY, isHidden ? 'true' : 'false');

		setIsHidden(isHidden);
	};

	useEffect(() => {
		const listener = (event: StorageEvent) => {
			if (event.key === MVK_WARNING_STORAGE_KEY) {
				setIsHidden(event.newValue === 'true');
			}
		};

		window.addEventListener('storage', listener);

		return () => {
			window.removeEventListener('storage', listener);
		};
	}, []);

	return (
		<FormItem>
			<Checkbox checked={isHidden} onChange={onChange} style={{ borderRadius: 'inherit' }}>
				{lang.use('vms_vmk_warning_hide')}
			</Checkbox>
		</FormItem>
	);
};

const AlertError = ({ onClosed }: AlertErrorProps) => {
	const [open, setOpen] = useState(true);
	const lang = useLang();

	useEffect(() => {
		setOpen(true);
	}, []);

	const onClick: React.MouseEventHandler<HTMLAnchorElement> = () => {
		const fvLink = getFVLink();

		if (fvLink) {
			window.location.href = fvLink;
		} else {
			window.location.href = 'https://vk.ru';
		}
	};

	return (
		<ModalPage
			nav="mvk-warning"
			open={open}
			onClose={() => {
				setOpen(false);
			}}
			onClosed={() => {
				onClosed?.();
			}}
			header={
				<ModalPageHeader>
					<IconLogoVkMusicSaverColorWithText38h />
				</ModalPageHeader>
			}
			size={500}
		>
			<Placeholder
				title={lang.use('vms_vmk_warning_title')}
				action={
					<Button onClick={onClick} size="l">
						{lang.use('vms_vmk_warning_go_vkcom')}
					</Button>
				}
			/>
			<HideWarningFormItem />
		</ModalPage>
	);
};

const init = async () => {
	await waitHTMLBody();

	const element = document.createElement('div');

	document.body.appendChild(element);

	const { unmount } = await initReactApp({
		root: element,
		content: (
			<AlertError
				onClosed={() => {
					unmount();
					element.remove();
				}}
			/>
		),
		disableParentTransformForPositionFixedElements: true,
		disablePortal: false,
	});
};

init().catch(console.error);
