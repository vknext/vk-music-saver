import { CustomModalPage } from '@vknext/shared/components/CustomModalPage/CustomModalPage';
import { useCustomModalControl } from '@vknext/shared/components/CustomModalPage/CustomModalPageContext';
import {
	Button,
	Div,
	FormStatus,
	ModalPageHeader,
	Placeholder,
	SelectionControl,
	Separator,
	SimpleCell,
	Spacing,
	Tooltip,
} from '@vkontakte/vkui';
import { useState } from 'react';
import AndroidSwitch from 'src/components/AndroidSwitch/AndroidSwitch';
import SettControl from 'src/react/components/SettControl/SettControl';
import useLang from 'src/react/hooks/useLang';
import GlobalStorage from 'src/storages/GlobalStorage';
import { DownloadFilesMethod } from 'src/storages/enums';
import styles from './index.module.scss';

interface SelectFCDirectoryModalProps {
	onSelect: (value: FileSystemDirectoryHandle | null) => void;
	onShowPicker: () => Promise<FileSystemDirectoryHandle>;
	showNumTracks?: boolean;
}

interface SettSaveMethodSelectionProps {
	value: boolean;
	setValue: (value: boolean) => void;
}

const SettSaveMethodSelection = ({ value, setValue }: SettSaveMethodSelectionProps) => {
	const lang = useLang();

	return (
		<SimpleCell
			Component="label"
			after={<AndroidSwitch checked={value} onChange={(e) => setValue(e.target.checked)} />}
			subtitle={lang.use('vms_sett_save_method_selection_description')}
			multiline
		>
			{lang.use('vms_sett_save_method_selection')}
		</SimpleCell>
	);
};

const Content = ({ onSelect, onShowPicker }: SelectFCDirectoryModalProps) => {
	const { closeModal } = useCustomModalControl();
	const lang = useLang();
	const [errorSelectFolder, setErrorSelectFolder] = useState<string | null>(null);
	const [saveMethodSelection, setSaveMethodSelection] = useState(false);

	const onSelectFolder = async () => {
		setErrorSelectFolder(null);

		try {
			const dirHandle = await onShowPicker();

			onSelect(dirHandle);

			if (saveMethodSelection) {
				await GlobalStorage.setValue('downloadMethod', DownloadFilesMethod.DIRECTORY);
			}

			closeModal();
		} catch (error) {
			console.error(error);

			setErrorSelectFolder(error.message);
		}
	};

	const onSelectZip = async () => {
		onSelect(null);

		if (saveMethodSelection) {
			await GlobalStorage.setValue('downloadMethod', DownloadFilesMethod.DIRECTORY);
		}

		closeModal();
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
						<Button size="m" onClick={onSelectZip}>
							{lang.use('vms_fs_select_zip')}
						</Button>
					</Placeholder.Actions>
				</Placeholder.Container>
			</Div>
			<Div style={{ paddingTop: 0, paddingBottom: 0 }}>
				<SettSaveMethodSelection value={saveMethodSelection} setValue={setSaveMethodSelection} />
			</Div>
			<Spacing size={12}>
				<Separator />
			</Spacing>
			<Div style={{ paddingTop: 0 }}>
				<SettControl option="numTracksInPlaylist" defaultValue={true}>
					{lang.use('vms_sett_num_tracks_in_playlist')}
				</SettControl>
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
