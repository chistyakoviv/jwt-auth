import { Storage } from '../types/storage';
import cookie, { CookieSerializeOptions } from 'cookie';
import { decodeValue, encodeValue, isSet, isUnset } from '../utils';

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

const DEFAULTS: CookieStorageOptions = {
    prefix: 'auth.',
    cookieOptions: {
        path: '/',
    },
};

export class CookieStorage implements Storage {
    private readonly options: CookieStorageOptions;

    constructor(options: CookieStorageOptions) {
        this.options = { ...DEFAULTS, ...options };
    }

    set<V>(key: string, value: V): V {
        document.cookie = cookie.serialize(
            this.options.prefix + key,
            encodeValue(value),
            this.options.cookieOptions as CookieSerializeOptions,
        );
        return value;
    }

    get<V>(key: string): V {
        const cookies = cookie.parse(document.cookie) || {};

        const value = cookies[key]
            ? decodeURIComponent(cookies[key] as string)
            : undefined;

        return decodeValue(value);
    }

    sync(key: string) {
        const value = this.get(key);

        if (isSet(value)) {
            this.set(key, value);
        }

        return value;
    }

    remove(key: string): void {
        this.set(key, false);
    }
}
