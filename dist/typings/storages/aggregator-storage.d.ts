import type { Storage } from '../types/storage';
export declare class AggregatorStorage implements Storage {
    private readonly storages;
    constructor(storages: Storage[]);
    set<V>(key: string, value: V): V;
    get<V>(key: string): V | null;
    sync<V>(key: string): V | null;
    remove(key: string): void;
}
