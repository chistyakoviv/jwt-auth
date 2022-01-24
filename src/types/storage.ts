export interface Storage {
    set<V>(key: string, value: V): V;

    get<V>(key: string): V | null;

    sync(key: string): any;

    remove(key: string): void;
}
