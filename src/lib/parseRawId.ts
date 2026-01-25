import { isAnyRawId } from 'src/utils/isAnyRawId';
import { isNumber } from 'src/utils/isNumber';

interface RawIdResult {
	id: number;
	ownerId: number;
	accessKey?: string;
}

function createInvalidRawIdError(rawId: string): Error {
	return new Error(`Invalid rawId ${rawId}`);
}

export const parseRawId = (rawId: string): RawIdResult => {
	if (!isAnyRawId(rawId)) {
		throw createInvalidRawIdError(rawId);
	}

	const parts = rawId.split('_');
	const ownerId = parts[0] ? parseInt(parts[0], 10) : NaN;
	const id = parts[1] ? parseInt(parts[1], 10) : NaN;
	const accessKey = parts[2];

	if (!isNumber(ownerId) || !isNumber(id)) {
		throw createInvalidRawIdError(rawId);
	}

	return {
		id,
		ownerId,
		accessKey,
	};
};
