export enum TokenStatusEnum {
    UNKNOWN = 'UNKNOWN',
    VALID = 'VALID',
    EXPIRED = 'EXPIRED',
}

export class TokenStatus {
    private readonly _status: TokenStatusEnum;

    constructor(tokenExpiresAt: number | false) {
        this._status = this._calculate(tokenExpiresAt);
    }

    unknown(): boolean {
        return TokenStatusEnum.UNKNOWN === this._status;
    }

    valid(): boolean {
        return TokenStatusEnum.VALID === this._status;
    }

    expired(): boolean {
        return TokenStatusEnum.EXPIRED === this._status;
    }

    private _calculate(tokenExpiresAt: number | false): TokenStatusEnum {
        const now = Date.now();

        if (!tokenExpiresAt) {
            return TokenStatusEnum.UNKNOWN;
        }

        // Some slack to help the token from expiring between validation and usage
        const timeSlackMillis = 500;
        tokenExpiresAt -= timeSlackMillis;

        if (now < tokenExpiresAt) {
            return TokenStatusEnum.VALID;
        }

        return TokenStatusEnum.EXPIRED;
    }
}
