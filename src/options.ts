import { Storage, StorageOptions } from './types/storage';
import { StrategyOptions, Strategy } from './types/strategy';
import { Auth } from './auth';
import { AxiosAdapter } from './http/axios-adapter';
import { HTTPClient } from './types/http';

type StrategyCtor = {
    new (auth: Auth, options: any): Strategy;
};

type StorageCtor = {
    new (options?: StorageOptions): Storage;
};

type HTTPClientCtor = {
    new (): HTTPClient;
};

export interface AuthOptions {
    redirect?: {
        login: string;
        logout: string;
        home: string;
    };
    httpClient?: HTTPClientCtor;
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

export const defaultOptions: AuthOptions = {
    redirect: {
        login: '/login',
        logout: '/logout',
        home: '/',
    },
    httpClient: AxiosAdapter,
    storages: [],
    strategies: [],
};
