import { Icon12Dropdown, Icon20Check } from '@vkontakte/icons';
import { SimpleCell } from '@vkontakte/vkui';
import { ActionsMenuAction, ActionsMenuPopover, ActionsMenuSeparator } from 'src/components/ActionsMenu';
import useLang from 'src/hooks/useLang';
import useStorageValue from 'src/hooks/useStorageValue';
import { DownloadFilesMethod } from 'src/storages/enums';

const SelectDownloadMethod = () => {
	const lang = useLang();
	const { value, setValue } = useStorageValue('download_files_method', DownloadFilesMethod.UNSELECTED);

	const getCurrentActionTitle = () => {
		if (value === DownloadFilesMethod.DIRECTORY) {
			return lang.use('vms_fs_option_folder_title');
		}
		if (value === DownloadFilesMethod.ZIP) {
			return lang.use('vms_fs_option_zip_title');
		}

		return lang.use('vms_fs_option_unselected_title');
	};

	return (
		<SimpleCell
			after={
				<ActionsMenuPopover
					placement="bottom-end"
					actions={
						<>
							<ActionsMenuAction
								multiline
								type="primary"
								size="large"
								rightIcon={
									<Icon20Check
										visibility={value === DownloadFilesMethod.UNSELECTED ? 'visible' : 'hidden'}
									/>
								}
								onClick={() => setValue(DownloadFilesMethod.UNSELECTED)}
							>
								{lang.use('vms_fs_option_unselected_title')}
							</ActionsMenuAction>
							<ActionsMenuSeparator />
							<ActionsMenuAction
								multiline
								type="primary"
								size="large"
								rightIcon={
									<Icon20Check
										visibility={value === DownloadFilesMethod.DIRECTORY ? 'visible' : 'hidden'}
									/>
								}
								onClick={() => setValue(DownloadFilesMethod.DIRECTORY)}
								subtitle={lang.use('vms_fs_option_folder_description')}
							>
								{lang.use('vms_fs_option_folder_title')}
							</ActionsMenuAction>
							<ActionsMenuSeparator />
							<ActionsMenuAction
								multiline
								type="primary"
								size="large"
								rightIcon={
									<Icon20Check
										visibility={value === DownloadFilesMethod.ZIP ? 'visible' : 'hidden'}
									/>
								}
								onClick={() => setValue(DownloadFilesMethod.ZIP)}
								subtitle={lang.use('vms_fs_option_zip_description')}
							>
								{lang.use('vms_fs_option_zip_title')}
							</ActionsMenuAction>
						</>
					}
				>
					<ActionsMenuAction rightIcon={<Icon12Dropdown />}>{getCurrentActionTitle()}</ActionsMenuAction>
				</ActionsMenuPopover>
			}
		>
			{lang.use('vms_fs_download_method_title')}
		</SimpleCell>
	);
};

export default SelectDownloadMethod;
