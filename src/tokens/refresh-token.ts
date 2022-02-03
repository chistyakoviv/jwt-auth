import jwtDecode from 'jwt-decode';
import type { JwtPayload } from 'jwt-decode';
import type { Storage } from '../types/storage';
import { addTokenPrefix } from '../utils';
import { TokenStatus } from './token-status';
import type { RefreshableStrategy } from '../types/strategy';

export class RefreshToken {
    private strategyKey: string;
    private expirationKey: string;

    constructor(
        private readonly strategy: RefreshableStrategy,
        private readonly storage: Storage,
    ) {
        this.strategyKey =
            this.strategy.options.refreshToken.prefix +
            this.strategy.options.name;

        this.expirationKey =
            this.strategy.options.refreshToken.expirationPrefix +
            this.strategy.options.name;
    }

    get(): string | boolean {
        return this.storage.get(this.strategyKey) as string | boolean;
    }

    set(tokenValue: string | boolean): string | boolean {
        const refreshToken = addTokenPrefix(
            tokenValue,
            this.strategy.options.refreshToken.type,
        );

        this._setToken(refreshToken);
        this._updateExpiration(refreshToken);

        return refreshToken;
    }

    sync(): string | boolean {
        const refreshToken = this._syncToken();
        this._syncExpiration();

        return refreshToken;
    }

    reset(): void {
        this._setToken(false);
        this._setExpiration(false);
    }

    status(): TokenStatus {
        return new TokenStatus(this._getExpiration());
    }

    private _getExpiration(): number | false {
        return this.storage.get(this.expirationKey) as number | false;
    }

    private _setExpiration(expiration: number | false): number | false {
        return this.storage.set(this.expirationKey, expiration) as
            | number
            | false;
    }

    private _syncExpiration(): number | false {
        return this.storage.sync(this.expirationKey) as number | false;
    }

    private _updateExpiration(
        refreshToken: string | boolean,
    ): number | false | void {
        let refreshTokenExpiration;
        const _tokenIssuedAtMillis = Date.now();
        const _tokenTTLMillis =
            Number(this.strategy.options.refreshToken.maxAge) * 1000;
        const _tokenExpiresAtMillis = _tokenTTLMillis
            ? _tokenIssuedAtMillis + _tokenTTLMillis
            : 0;

        try {
            const exp = jwtDecode<JwtPayload>(refreshToken + '').exp;
            refreshTokenExpiration = exp ? exp * 1000 : _tokenExpiresAtMillis;
        } catch (error: any) {
            // If the token is not jwt, we can't decode and refresh it, use _tokenExpiresAt value
            refreshTokenExpiration = _tokenExpiresAtMillis;

            if (!(error && error.name === 'InvalidTokenError')) {
                throw error;
            }
        }

        // Set token expiration
        return this._setExpiration(refreshTokenExpiration || false);
    }

    private _setToken(refreshToken: string | boolean): string | boolean {
        return this.storage.set(this.strategyKey, refreshToken) as
            | string
            | boolean;
    }

    private _syncToken(): string | boolean {
        return this.storage.sync(this.strategyKey) as string | boolean;
    }
}
