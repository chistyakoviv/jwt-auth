import type { TokenableStrategy } from '../types/strategy';
import type { Storage } from '../types/storage';
import jwtDecode from 'jwt-decode';
import type { JwtPayload } from 'jwt-decode';
import { addTokenPrefix } from '../utils';
import { TokenStatus } from './token-status';

export class Token {
    private strategyKey: string;
    private expirationKey: string;

    constructor(
        private readonly strategy: TokenableStrategy,
        private readonly storage: Storage,
    ) {
        this.strategyKey =
            this.strategy.options.token.prefix + this.strategy.options.name;

        this.expirationKey =
            this.strategy.options.token.expirationPrefix +
            this.strategy.options.name;
    }

    get(): string | boolean {
        return this.storage.get(this.strategyKey) as string | boolean;
    }

    set(tokenValue: string | boolean): string | boolean {
        const token = addTokenPrefix(
            tokenValue,
            this.strategy.options.token.type,
        );

        this._setToken(token);
        this._updateExpiration(token);

        if (typeof token === 'string') {
            this.strategy.requestController.setHeader(token);
        }

        return token;
    }

    sync(): string | boolean {
        const token = this._syncToken();
        this._syncExpiration();

        if (typeof token === 'string') {
            this.strategy.requestController.setHeader(token);
        }

        return token;
    }

    reset(): void {
        this.strategy.requestController.clearHeader();
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

    private _updateExpiration(token: string | boolean): number | false | void {
        let tokenExpiration;
        const _tokenIssuedAtMillis = Date.now();
        const _tokenTTLMillis =
            Number(this.strategy.options.token.maxAge) * 1000;
        const _tokenExpiresAtMillis = _tokenTTLMillis
            ? _tokenIssuedAtMillis + _tokenTTLMillis
            : 0;

        try {
            const exp = jwtDecode<JwtPayload>(token + '').exp;
            tokenExpiration = exp ? exp * 1000 : _tokenExpiresAtMillis;
        } catch (error: any) {
            // If the token is not jwt, we can't decode and refresh it, use _tokenExpiresAt value
            tokenExpiration = _tokenExpiresAtMillis;

            if (!(error && error.name === 'InvalidTokenError')) {
                throw error;
            }
        }

        // Set token expiration
        return this._setExpiration(tokenExpiration || false);
    }

    private _setToken(token: string | boolean): string | boolean {
        return this.storage.set(this.strategyKey, token) as string | boolean;
    }

    private _syncToken(): string | boolean {
        return this.storage.sync(this.strategyKey) as string | boolean;
    }
}
