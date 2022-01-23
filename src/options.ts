import { IStorage } from './types/storage';
import { BaseStrategy } from './strategies/base-strategy';
import { StrategyOptions } from './types/strategy';

export interface AuthOptions {
    redirect: {
        login: string;
        logout: string;
        home: string;
    };
    storages: IStorage[];
    strategies: {
        strategy: typeof BaseStrategy;
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
