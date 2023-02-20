import { Storage, StorageOptions } from './types/storage';
import { StrategyOptions, Strategy } from './types/strategy';
import { Auth } from './auth';
import { AxiosAdapter } from './http/axios-adapter';
import { HTTPClient } from './types/http';

type StrategyCtor = {
    new (auth: Auth, options: StrategyOptions): Strategy;
};

type StorageCtor = {
    new (options?: StorageOptions): Storage;
};

type HTTPClientCtor = {
    new (): HTTPClient;
};

type StorageOption = {
    storage: StorageCtor;
    storageOptions?: StorageOptions;
};

type StrategyOption = {
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

export const defaultOptions: AuthOptions = {
    redirect: {
        login: '/login',
        logout: '/logout',
        home: '/',
    },
    storages: [],
    strategies: [],
};
