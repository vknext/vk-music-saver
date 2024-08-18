declare module '*.module.scss' {
	const styles: { [className: string]: string };
	export = styles;
}

declare module 'browser-id3-writer';

declare module '*.svg' {
	const svg: string;
	export default svg;
}

declare module '*.scss';
