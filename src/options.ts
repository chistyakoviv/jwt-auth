import { Storage, StorageOptions } from './types/storage';
import { StrategyOptions, Strategy } from './types/strategy';
import { Auth } from './auth';

type StrategyCtor = {
    new (auth: Auth, options: any): Strategy;
};

type StorageCtor = {
    new (options?: StorageOptions): Storage;
};

export interface AuthOptions {
    redirect?: {
        login: string;
        logout: string;
        home: string;
    };
    defaultStrategy?: string;
    storages: {
        storage: StorageCtor;
        storageOptions?: StorageOptions;
    }[];
    strategies: {
        strategy: StrategyCtor;
        strategyOptions: StrategyOptions;
    }[];
}

export const deufaultOptions: AuthOptions = {
    redirect: {
        login: '/login',
        logout: '/logout',
        home: '/',
    },
    storages: [],
    strategies: [],
};
