export interface VMSGetConfigResponse {
	prime: {
		enabled: boolean;
		vk_donut: boolean;
		url?: string;
	};
	deluxe: {
		enabled: boolean;
		vk_donut: boolean;
		url?: string;
	};
	ffmpegConfig?: {
		method: `vms.${string}`;
		force: boolean;
	};
}
