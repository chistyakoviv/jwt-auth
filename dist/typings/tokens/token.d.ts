import type { TokenableStrategy } from '../types/strategy';
import type { Storage } from '../types/storage';
import { TokenStatus } from './token-status';
export declare class Token {
    private readonly strategy;
    private readonly storage;
    private strategyKey;
    private expirationKey;
    constructor(strategy: TokenableStrategy, storage: Storage);
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
