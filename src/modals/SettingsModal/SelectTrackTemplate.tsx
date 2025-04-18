import {
	CustomSelectOption,
	FormItem,
	Select,
	type CustomSelectOptionInterface,
	type CustomSelectRenderOption,
} from '@vkontakte/vkui';
import { useMemo } from 'react';
import { DEFAULT_TRACK_TEMPLATE, TRACK_TEMPLATE_PRESETS, TrackTemplateVariable } from 'src/common/constants';
import useLang from 'src/hooks/useLang';
import useStorageValue from 'src/hooks/useStorageValue';
import { formatTrackName, type formatTrackFilenameProps } from 'src/musicUtils/formatTrackName';

const templatePropsDefault: Omit<formatTrackFilenameProps, 'template' | 'index'> = {
	artist: 'Max Ivanov',
	title: 'Вечерний дождь',
	subtitle: 'prod by PetrovichBeats',
	bitrate: 320,
};

const options: CustomSelectOptionInterface[] = TRACK_TEMPLATE_PRESETS.map((item) => {
	return {
		value: item,
		label: formatTrackName({
			template: item,
		}),
		description: item,
	};
});

const renderOption = ({ option, ...restProps }: CustomSelectRenderOption<CustomSelectOptionInterface>) => {
	return <CustomSelectOption {...restProps} description={option.description} />;
};

const SingleTrackTemplate = () => {
	const lang = useLang();
	const { value, setValue, isLoading } = useStorageValue('single_track_template', DEFAULT_TRACK_TEMPLATE);

	const options = useMemo(() => {
		return TRACK_TEMPLATE_PRESETS.map((item) => {
			return {
				value: item,
				label: formatTrackName({ template: item, ...templatePropsDefault }),
				description: item,
			};
		});
	}, []);

	return (
		<FormItem top={lang.use('vms_sett_single_track_template')} topMultiline>
			<Select
				options={options}
				value={value}
				onChange={(e) => setValue(e.target.value)}
				disabled={isLoading}
				renderOption={renderOption}
			/>
		</FormItem>
	);
};

const PlaylistTrackTemplate = () => {
	const lang = useLang();
	const { value, setValue, isLoading } = useStorageValue('playlist_track_template', DEFAULT_TRACK_TEMPLATE);
	const { value: isNumTracksInPlaylist } = useStorageValue('numTracksInPlaylist', true);

	const options = useMemo(() => {
		return TRACK_TEMPLATE_PRESETS.map((item) => {
			return {
				value: item,
				label: formatTrackName({
					template: item,
					index: isNumTracksInPlaylist ? 1 : undefined,
					...templatePropsDefault,
				}),
				description: isNumTracksInPlaylist ? `${TrackTemplateVariable.INDEX}. ${item}` : item,
			};
		});
	}, [isNumTracksInPlaylist]);

	return (
		<FormItem top={lang.use('vms_sett_playlist_track_template')} topMultiline>
			<Select
				options={options}
				value={value}
				onChange={(e) => setValue(e.target.value)}
				disabled={isLoading}
				renderOption={renderOption}
			/>
		</FormItem>
	);
};

const SelectTrackTemplate = () => {
	return (
		<>
			<SingleTrackTemplate />
			<PlaylistTrackTemplate />
		</>
	);
};

export default SelectTrackTemplate;
