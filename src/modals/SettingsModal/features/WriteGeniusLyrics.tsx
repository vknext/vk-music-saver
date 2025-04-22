import { Accordion } from '@vkontakte/vkui';
import SettControl from 'src/components/SettControl/SettControl';
import useLang from 'src/hooks/useLang';
import useStorageValue from 'src/hooks/useStorageValue';

const WriteGeniusLyrics = () => {
	const lang = useLang();
	const { value: isWriteTags, isLoading } = useStorageValue('audio_write_id3_tags', true);

	return (
		<Accordion expanded={isLoading ? true : isWriteTags}>
			<Accordion.Content>
				<SettControl
					option="audio_write_genius_lyrics"
					defaultValue={true}
					subtitle={lang.use('vms_sett_audio_write_genius_lyrics_desc')}
					disabled={isLoading}
				>
					{lang.use('vms_sett_audio_write_genius_lyrics')}
				</SettControl>
			</Accordion.Content>
		</Accordion>
	);
};

export default WriteGeniusLyrics;
