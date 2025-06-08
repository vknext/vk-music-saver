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
import { padWithZeros } from 'src/lib/padWithZeros';
import { formatTrackName, type formatTrackFilenameProps } from 'src/musicUtils/formatTrackName';

const templatePropsDefault: Omit<formatTrackFilenameProps, 'template' | 'index'> = {
	artist: 'Max Ivanov',
	title: 'Вечерний дождь',
	subtitle: 'prod by PetrovichBeats',
	bitrate: 320,
};

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
	const { value: isNumTracksInPlaylist } = useStorageValue('num_tracks_in_playlist', true);
	const { value: isAddLeadingZeros } = useStorageValue('add_leading_zeros', false);

	const options = useMemo(() => {
		return TRACK_TEMPLATE_PRESETS.map((item) => {
			let index = undefined;

			if (isNumTracksInPlaylist) {
				index = TRACK_TEMPLATE_PRESETS.indexOf(item) + 1;
			}

			if (isAddLeadingZeros && index !== undefined) {
				index = padWithZeros(index, 100);
			}

			return {
				value: item,
				label: formatTrackName({
					...templatePropsDefault,
					template: item,
					index,
				}),
				description: isNumTracksInPlaylist ? `${TrackTemplateVariable.INDEX}. ${item}` : item,
			};
		});
	}, [isNumTracksInPlaylist, isAddLeadingZeros]);

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
