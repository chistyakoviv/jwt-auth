export interface StorageOptions {
    prefix: string;
}
export interface Storage {
    set<V>(key: string, value: V): V;
    get<V>(key: string): V | null;
    sync<V>(key: string): V | null;
    remove(key: string): void;
}
