const generateRandomKey = <T extends 'vms_mbs' | 'vms_ibs' | string>(prefix: T): `_${T}_${string}` => {
	/**
	 * vknext - 10
	 * vms - 9
	 * vcf - 8
	 */
	const randomString = Math.random().toString(36).substring(2, 9);

	return `_${prefix}_${randomString}`;
};

export const generateObservedElementMBSKey = () => generateRandomKey('vms_mbs');
export const generateObservedElementIBSKey = () => generateRandomKey('vms_ibs');

export const generateObservedElementUniqueKey = () => generateRandomKey('vms');
