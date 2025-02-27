import getGlobalVKNext from 'src/getGlobalVKNext';
import ObservedHTMLElementsCleaner from './observedHTMLElements/ObservedHTMLElementsCleaner';

const observedElementsCleaner = new ObservedHTMLElementsCleaner();

if (process.env.NODE_ENV === 'development') {
	// @ts-ignore мне лень писать тип, извините
	getGlobalVKNext()._vms_observedElementsCleaner = observedElementsCleaner;
}

export default observedElementsCleaner;
