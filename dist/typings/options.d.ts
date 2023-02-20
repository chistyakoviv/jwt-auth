import { Storage, StorageOptions } from './types/storage';
import { StrategyOptions, Strategy } from './types/strategy';
import { Auth } from './auth';
import { HTTPClient } from './types/http';
declare type StrategyCtor = {
    new (auth: Auth, options: StrategyOptions): Strategy;
};
declare type StorageCtor = {
    new (options?: StorageOptions): Storage;
};
declare type StorageOption = {
    storage: StorageCtor;
    storageOptions?: StorageOptions;
};
declare type StrategyOption = {
    strategy: StrategyCtor;
    strategyOptions: StrategyOptions;
};
export interface AuthOptions {
    redirect?: {
        login: string;
        logout: string;
        home: string;
    };
    httpClient?: HTTPClient;
    defaultStrategy?: string;
    storages: StorageOption[];
    strategies: StrategyOption[];
}
export declare const defaultOptions: AuthOptions;
export {};
