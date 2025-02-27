import { Button, Div, FormStatus, ModalPageHeader, Placeholder, Tooltip } from '@vkontakte/vkui';
import { useState } from 'react';
import CustomModalPage from 'src/react/components/CustomModalPage/CustomModalPage';
import { useCustomModalControl } from 'src/react/components/CustomModalPage/CustomModalPageContext';
import useLang from 'src/react/hooks/useLang';
import styles from './index.module.scss';

interface SelectFCDirectoryModalProps {
	onSelect: (directory: FileSystemDirectoryHandle | null) => void;
	onShowPicker: () => Promise<FileSystemDirectoryHandle>;
}

const Content = ({ onSelect, onShowPicker }: SelectFCDirectoryModalProps) => {
	const { closeModal } = useCustomModalControl();
	const lang = useLang();

	const [errorSelectFolder, setErrorSelectFolder] = useState<string | null>(null);

	const onSelectFolder = async () => {
		setErrorSelectFolder(null);

		try {
			const dirHandle = await onShowPicker();

			onSelect(dirHandle);
			closeModal();
		} catch (error) {
			console.error(error);

			setErrorSelectFolder(error.message);
		}
	};

	return (
		<>
			{errorSelectFolder && (
				<Div>
					<FormStatus title={lang.use('vms_fs_error_selecting_directory')} mode="error">
						{errorSelectFolder}
					</FormStatus>
				</Div>
			)}
			<Div className={styles.SelectFCDirectory__methods}>
				<Tooltip
					defaultShown
					usePortal={false}
					appearance="accent"
					placement="bottom"
					description={lang.use('vms_fs_select_recommended')}
				>
					<Placeholder.Container noPadding className={styles.Card}>
						<Placeholder.Title>{lang.use('vms_fs_option_folder_title')}</Placeholder.Title>
						<Placeholder.Description>
							{lang.use('vms_fs_option_folder_description')}
						</Placeholder.Description>
						<Placeholder.Actions>
							<Button size="m" onClick={onSelectFolder}>
								{lang.use('vms_fs_select_folder')}
							</Button>
						</Placeholder.Actions>
					</Placeholder.Container>
				</Tooltip>
				<Placeholder.Container noPadding className={styles.Card}>
					<Placeholder.Title>{lang.use('vms_fs_option_zip_title')}</Placeholder.Title>
					<Placeholder.Description>{lang.use('vms_fs_option_zip_description')}</Placeholder.Description>
					<Placeholder.Actions>
						<Button
							size="m"
							onClick={() => {
								onSelect(null);
								closeModal();
							}}
						>
							{lang.use('vms_fs_select_zip')}
						</Button>
					</Placeholder.Actions>
				</Placeholder.Container>
			</Div>
		</>
	);
};

const SelectFCDirectoryModal = (props: SelectFCDirectoryModalProps) => {
	const lang = useLang();

	return (
		<CustomModalPage size={600} header={<ModalPageHeader>{lang.use('vms_fs_method_selection')}</ModalPageHeader>}>
			<Content {...props} />
		</CustomModalPage>
	);
};

export default SelectFCDirectoryModal;
