import {
	Button,
	Div,
	FormStatus,
	ModalPageHeader,
	Placeholder,
	SelectionControl,
	Switch,
	Tooltip,
} from '@vkontakte/vkui';
import { useState } from 'react';
import CustomModalPage from 'src/react/components/CustomModalPage/CustomModalPage';
import { useCustomModalControl } from 'src/react/components/CustomModalPage/CustomModalPageContext';
import useLang from 'src/react/hooks/useLang';
import { useLocalStorage } from 'usehooks-ts';
import styles from './index.module.scss';

interface SelectFCDirectoryModalProps {
	onSelect: (value: [directory: FileSystemDirectoryHandle | null, isNumTracks: boolean]) => void;
	onShowPicker: () => Promise<FileSystemDirectoryHandle>;
	showNumTracks?: boolean;
}

const Content = ({ onSelect, onShowPicker }: SelectFCDirectoryModalProps) => {
	const { closeModal } = useCustomModalControl();
	const lang = useLang();
	const [isNumTracks] = useLocalStorage('vms_sett_num_tracks_in_playlist', true);

	const [errorSelectFolder, setErrorSelectFolder] = useState<string | null>(null);

	const onSelectFolder = async () => {
		setErrorSelectFolder(null);

		try {
			const dirHandle = await onShowPicker();

			onSelect([dirHandle, isNumTracks]);
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
					placement="left"
					description={lang.use('vms_fs_select_recommended')}
					style={{ maxWidth: 150 }}
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
								onSelect([null, isNumTracks]);
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

const SettNumTracks = () => {
	const lang = useLang();
	const [value, setValue] = useLocalStorage('vms_sett_num_tracks_in_playlist', true);

	return (
		<Div style={{ paddingTop: 0 }}>
			<SelectionControl>
				<SelectionControl.Label>{lang.use('vms_sett_num_tracks_in_playlist')}</SelectionControl.Label>
				<Switch checked={value} onChange={(e) => setValue(e.target.checked)} />
			</SelectionControl>
		</Div>
	);
};

const SelectFCDirectoryModal = ({ ...props }: SelectFCDirectoryModalProps) => {
	const lang = useLang();

	return (
		<CustomModalPage size={600} header={<ModalPageHeader>{lang.use('vms_fs_method_selection')}</ModalPageHeader>}>
			<Content {...props} />
			<SettNumTracks />
		</CustomModalPage>
	);
};

export default SelectFCDirectoryModal;
