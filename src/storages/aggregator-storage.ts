import { isSet } from '../utils';
import type { Storage } from '../types/storage';

export class AggregatorStorage implements Storage {
    constructor(private readonly storages: Storage[]) {}

    set<V>(key: string, value: V): V {
        this.storages.forEach((storage) => storage.set(key, value));
        return value;
    }

    get<V>(key: string): V | null {
        for (let i = 0; i < this.storages.length; i++) {
            const storage = this.storages[i];
            const value = storage.get(key) as any;

            if (isSet(value)) return value;
        }
        return null;
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
