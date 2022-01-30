import { Storage } from './types/storage';
import { StrategyOptions, Strategy } from './types/strategy';
import { Auth } from './auth';

type StrategyCtor = {
    new (auth: Auth, options: any): Strategy;
};

export interface AuthOptions {
    redirect?: {
        login: string;
        logout: string;
        home: string;
    };
    defaultStrategy?: string;
    storages: Storage[];
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
