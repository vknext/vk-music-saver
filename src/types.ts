export interface DownloadTargetElement extends HTMLElement {
	vms_down_inj?: boolean;
}

export interface ClientZipFile {
	name: string;
	lastModified: Date;
	input: Blob;
}

export interface ObservedHTMLElement extends HTMLElement {
	_vms_mbs?: MutationObserver;
	_vms_ibs?: IntersectionObserver;
}
