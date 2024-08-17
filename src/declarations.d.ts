declare module '*.module.scss' {
	const styles: { [className: string]: string };
	export = styles;
}

declare module 'browser-id3-writer';
