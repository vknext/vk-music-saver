import onAddAudioRow from 'src/interactions/onAddAudioRow';
import getAudioBitrate from 'src/musicUtils/getAudioBitrate';
import * as styles from './index.module.scss';
import lang from 'src/lang';

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

	const bitrateEl = document.createElement('span');
	bitrateEl.className = styles.audioRow__bitrate;
	bitrateEl.innerText = lang.use('vms_loading');

	rowInfo.classList.add(styles['audioRow__info--withBitrate']);
	rowInfo.appendChild(bitrateEl);

	// получаем битрейт только если элемент виден на экране на 10%
	const observer = new IntersectionObserver(
		async (entries, observer) => {
			entries.forEach(async (entry) => {
				if (entry.isIntersecting) {
					const result = await getAudioBitrate(audioObject);

					if (result?.bitrate) {
						bitrateEl.innerText = `${result.bitrate}`;
					} else {
						bitrateEl.innerText = lang.use('vms_error');
					}

					observer.unobserve(row);
				}
			});
		},
		{ threshold: 0.1 }
	);

	observer.observe(bitrateEl);
};

const initShowBitrateNearDuration = () => {
	onAddAudioRow(onAddRow);
};

export default initShowBitrateNearDuration;
