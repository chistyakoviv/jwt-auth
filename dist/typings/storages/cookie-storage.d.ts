import { Storage } from '../types/storage';
export interface CookieStorageOptions {
    prefix: string;
    cookieOptions?: {
        path: string;
        expires?: number | Date;
        maxAge?: number;
        domain?: string;
        httpOnly?: boolean;
    };
}
export declare class CookieStorage implements Storage {
    private readonly options;
    constructor(options?: CookieStorageOptions);
    set<V>(key: string, value: V): V;
    get<V>(key: string): V;
    sync<V>(key: string): V;
    remove(key: string): void;
}
