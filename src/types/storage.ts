export interface IStorage {
    set<V>(key: string, value: V): void;

    get<V>(key: string): V | null;
}
