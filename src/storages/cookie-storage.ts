import { Storage } from '../types/storage';
import { CookieSerializeOptions, parse, serialize } from 'cookie';
import { decodeValue, encodeValue, isUnset } from '../utils';

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

    constructor(options?: CookieStorageOptions) {
        this.options = { ...DEFAULTS, ...options };
    }

    set<V>(key: string, value: V): V {
        if (isUnset(value)) {
            this.remove(key);
            return value;
        }

        document.cookie = serialize(
            this.options.prefix + key,
            encodeValue(value),
            this.options.cookieOptions as CookieSerializeOptions,
        );

        return value;
    }

    get<V>(key: string): V {
        const cookieKey = this.options.prefix + key;
        const cookies = parse(document.cookie) || {};

        const value = cookies[cookieKey]
            ? decodeURIComponent(cookies[cookieKey] as string)
            : undefined;

        return decodeValue(value);
    }

    sync<V>(key: string): V {
        const value: V = this.get(key);
        return value;
    }

    remove(key: string): void {
        this.set(key, false);
    }
}
