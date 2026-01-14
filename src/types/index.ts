export interface DownloadTargetElement extends HTMLElement {
	vms_down_inj?: boolean;
}

export interface ClientZipFile {
	name: string;
	lastModified: Date;
	input: Blob | ReadableStream;
}
