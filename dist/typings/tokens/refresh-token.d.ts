import type { Storage } from '../types/storage';
import { TokenStatus } from './token-status';
import type { RefreshableStrategy } from '../types/strategy';
export declare class RefreshToken {
    private readonly strategy;
    private readonly storage;
    private strategyKey;
    private expirationKey;
    constructor(strategy: RefreshableStrategy, storage: Storage);
    get(): string | boolean;
    set(tokenValue: string | boolean): string | boolean;
    sync(): string | boolean;
    reset(): void;
    status(): TokenStatus;
    private _getExpiration;
    private _setExpiration;
    private _syncExpiration;
    private _updateExpiration;
    private _setToken;
    private _syncToken;
}
