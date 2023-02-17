import type { Storage } from '../types/storage';
export interface LocalStorageOptions {
    prefix: string;
    ignoreExceptions?: boolean;
}
export declare class LocalStorage implements Storage {
    private readonly options;
    constructor(options?: LocalStorageOptions);
    set<V>(key: string, value: V): V;
    get<V>(key: string): V | null;
    sync<V>(key: string): V | null;
    remove(key: string): void;
}
