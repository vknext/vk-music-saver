import pluralFrom from 'src/lib/pluralFrom';

type Formatted = number | string | React.JSX.Element;
type FormatObject<U extends Formatted> = { [key: string]: U };

export interface LangMap {
	[key: string]: string | string[];
}

class Lang<T extends LangMap> {
	protected isDebug: boolean = false;
	protected decodedKeys: T;

	constructor(decodedKeys: T) {
		this.decodedKeys = decodedKeys;
	}

	use<U extends Formatted>(
		key: keyof T,
		values: FormatObject<U> | null | number = {},
		mode: 'raw' | 'decode' = 'decode'
	): string {
		if (!key) {
			return '...';
		}

		if (this.isDebug) {
			return key as string;
		}

		if (!(key in this.decodedKeys)) {
			return '';
		}

		let template = this.decodedKeys[key] as string | string[];

		if (mode === 'raw') {
			return template as string;
		}

		if (Array.isArray(template) && typeof values === 'number') {
			return pluralFrom(values, template);
		}

		if (typeof template === 'string' && values && typeof values === 'object') {
			for (const [variable, name] of template.matchAll(/\{(.*?)\}/g)) {
				const replaceValue = (values[name] as string) || '';

				template = String(template).replace(variable, replaceValue);
			}
		}

		return template as string;
	}

	toggleDebug() {
		this.isDebug = !this.isDebug;
	}
}

export default Lang;
