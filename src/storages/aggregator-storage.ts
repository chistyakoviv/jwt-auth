import { isSet } from '../utils';
import { IStorage } from '../types/storage';

export class AggregatorStorage implements IStorage {
    constructor(private readonly storages: IStorage[]) {}

    set<V>(key: string, value: V): void {
        this.storages.forEach((storage) => storage.set(key, value));
    }

    get<V>(key: string): V | null {
        for (let i = 0; i < this.storages.length; i++) {
            const storage = this.storages[i];
            const value = storage.get(key) as any;

            if (isSet(value)) return value;
        }
        return null;
    }
}
