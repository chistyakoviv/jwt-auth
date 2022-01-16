import { IStorage } from './types/storage';
import cookie, { CookieSerializeOptions } from 'cookie';
import { decodeValue, encodeValue } from './utils';

export interface CookieStorageOptions {
    prefix: string;
    cookieOptions: {
        path: string;
        expires?: number | Date;
        maxAge?: number;
        domain?: string;
        httpOnly?: boolean;
    };
}

export class CookieStorage implements IStorage {
    constructor(private readonly options: CookieStorageOptions) {}

    set<V>(key: string, value: V): void {
        document.cookie = cookie.serialize(
            this.options.prefix + key,
            encodeValue(value),
            this.options.cookieOptions as CookieSerializeOptions,
        );
    }

    get<V>(key: string): V {
        const cookies = cookie.parse(document.cookie) || {};

        const value = cookies[key]
            ? decodeURIComponent(cookies[key] as string)
            : undefined;

        return decodeValue(value);
    }
}
