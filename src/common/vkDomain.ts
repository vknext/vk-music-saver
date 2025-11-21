const host = globalThis.location.host.split('.');

let vkDomain: string;

if (host[0] !== 'vk') {
	vkDomain = 'vk.ru';
} else {
	vkDomain = `vk.${host[host.length - 1] || 'ru'}`;
}

export default vkDomain;
