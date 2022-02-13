import { decodeValue, isSet } from '../utils';
import type { Storage } from '../types/storage';
import { encodeValue, merge, isUnset } from '../utils';

export interface LocalStorageOptions {
    prefix: string;
    ignoreExceptions?: boolean;
}

const DEFAULTS: LocalStorageOptions = {
    prefix: 'auth.',
    ignoreExceptions: false,
};

export class LocalStorage implements Storage {
    private readonly options: LocalStorageOptions;

    constructor(options?: LocalStorageOptions) {
        this.options = merge(options, DEFAULTS);
    }

    set<V>(key: string, value: V): V {
        if (localStorage === undefined) return value;

        if (isUnset(value)) {
            this.remove(key);
            return value;
        }

        try {
            localStorage.setItem(this.options.prefix + key, encodeValue(value));
        } catch (e) {
            if (!this.options.ignoreExceptions) {
                throw e;
            }
        }

        return value;
    }

    get<V>(key: string): V | null {
        if (localStorage === undefined) return null;

        const value = localStorage.getItem(this.options.prefix + key);

        return decodeValue(value);
    }

    sync<V>(key: string): V | null {
        const value: V | null = this.get(key);

        if (isSet(value)) {
            this.set(key, value);
        }

        return value;
    }

    remove(key: string): void {
        this.set(key, false);
    }
}
