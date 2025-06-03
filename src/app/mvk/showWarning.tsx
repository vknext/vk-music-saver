import { waitHTMLBody } from '@vknext/shared/utils/waitHTMLBody';
import { Button, ModalPage, ModalPageHeader, Placeholder } from '@vkontakte/vkui';
import { useEffect, useState } from 'react';
import useLang from 'src/hooks/useLang';
import initReactApp from 'src/react/initReactApp';

interface AlertErrorProps {
	onClosed?: () => void;
}

const getFVLink = (): string | null => {
	// @ts-expect-error TODO: добавить в типы @vknext/shared
	const navFvLink = window.nav.fv_link;

	if (navFvLink) {
		return navFvLink;
	}

	const desktopVersion = document.querySelector('#l_menu_desktop_version [href]');
	if (!desktopVersion) return null;

	return desktopVersion.getAttribute('href');
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
			window.location.href = 'https://vk.com';
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
			header={<ModalPageHeader>VK Music Saver</ModalPageHeader>}
			size={500}
		>
			<Placeholder
				title={lang.use('vms_vmk_warning_title')}
				action={
					<Button onClick={onClick} size="m">
						{lang.use('vms_vmk_warning_go_vkcom')}
					</Button>
				}
			></Placeholder>
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
