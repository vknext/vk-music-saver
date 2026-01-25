import { parseRawId } from './parseRawId';

interface OwnedIdentityProps {
	id: number;
	ownerId: number;
	accessKey?: string;
}

export class OwnedIdentity {
	private _id: number;
	private _ownerId: number;
	private _accessKey?: string;

	constructor({ id, ownerId, accessKey }: OwnedIdentityProps) {
		this._id = id;
		this._ownerId = ownerId;
		this._accessKey = accessKey;
	}

	static fromRawId(rawId: string) {
		return new OwnedIdentity(parseRawId(rawId));
	}

	get id() {
		return this._id;
	}

	get ownerId() {
		return this._ownerId;
	}

	get accessKey() {
		return this._accessKey;
	}

	get rawId() {
		const { id, ownerId } = this;

		return `${ownerId}_${id}`;
	}

	get accessRawId() {
		const { accessKey } = this;

		if (accessKey) {
			return `${this.rawId}_${accessKey}`;
		}

		return this.rawId;
	}
}
