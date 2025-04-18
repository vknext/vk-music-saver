import type { ObservedHTMLElement } from 'src/types/global';
import onCurBackHide from 'src/listeners/onCurBackHide';

class ObservedHTMLElementsCleaner {
	private elements: Set<ObservedHTMLElement> = new Set();
	protected isClearInit = false;

	add(item: ObservedHTMLElement) {
		this.elements.add(item);

		this.initClear();
	}

	protected clear() {
		for (const el of this.elements) {
			for (const _key of Object.keys(el)) {
				const key = _key as keyof Pick<ObservedHTMLElement, '_vms_ibs' | '_vms_mbs'>;

				if (key.startsWith('_ibs') || key.startsWith('_mbs')) {
					const observer = el[key];

					observer?.disconnect();

					delete el[key];

					if (process.env.NODE_ENV === 'development') {
						console.info(`[VMS/ObservedHTMLElementsCleaner] remove observer`, { el, key, observer });
					}
				}
			}

			this.elements.delete(el);
		}
	}

	protected initClear() {
		if (this.isClearInit) return;
		this.isClearInit = true;

		onCurBackHide(() => {
			this.clear();

			this.isClearInit = false;
		});
	}
}

export default ObservedHTMLElementsCleaner;
