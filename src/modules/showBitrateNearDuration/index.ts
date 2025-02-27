import type { AudioObject } from 'src/global';
import onAddAudioRow from 'src/interactions/onAddAudioRow';
import onAddAudioRowReact from 'src/interactions/onAddAudioRowReact';
import lang from 'src/lang';
import getAudioBitrate from 'src/musicUtils/getAudioBitrate';
import type { AudioAudio } from 'src/schemas/objects';
import styles from './index.module.scss';

const createBitrateElement = (audio: AudioAudio | AudioObject) => {
	const bitrateEl = document.createElement('span');
	bitrateEl.className = styles.audioRow__bitrate;
	bitrateEl.innerText = lang.use('vms_loading');

	const observer = new IntersectionObserver(
		async (entries, observer) => {
			entries.forEach(async (entry) => {
				if (entry.isIntersecting) {
					const result = await getAudioBitrate(audio);

					if (result?.bitrate) {
						bitrateEl.innerText = `${result.bitrate}`;
					} else {
						bitrateEl.innerText = lang.use('vms_error');
					}

					observer.unobserve(bitrateEl);
				}
			});
		},
		{ threshold: 0.1 }
	);

	observer.observe(bitrateEl);

	return bitrateEl;
};

const onAddRow = async (row: HTMLElement) => {
	const audio = row.dataset.audio;
	if (!audio) return;

	const audioObject = AudioUtils.audioTupleToAudioObject(JSON.parse(audio));
	if (!audioObject) return;

	if (audioObject?.restrictionStatus || row.classList.contains('audio_row__deleted')) {
		return;
	}

	const rowInfo = row.querySelector<HTMLElement>('.audio_row__info');
	if (!rowInfo) return;

	if (rowInfo.getElementsByClassName(styles.audioRow__bitrate).length) {
		return;
	}

	const bitrateEl = createBitrateElement(audioObject);

	rowInfo.classList.add(styles['audioRow__info--withBitrate']);
	rowInfo.appendChild(bitrateEl);
};

const onAddRowReact = async (row: HTMLElement, audio: AudioAudio | null) => {
	if (!audio) return;

	const rowAfter = row.querySelector<HTMLElement>(`[class*="AudioRow__after--"]`);
	if (!rowAfter) return;

	if (rowAfter.getElementsByClassName(styles.audioRow__bitrate).length) {
		return;
	}

	const bitrateEl = createBitrateElement(audio);

	rowAfter.classList.add(styles['audioRowReact--withBitrate']);
	rowAfter.appendChild(bitrateEl);
};

const initShowBitrateNearDuration = () => {
	onAddAudioRow(onAddRow);
	onAddAudioRowReact(onAddRowReact);
};

export default initShowBitrateNearDuration;
