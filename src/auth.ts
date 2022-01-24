import { AuthOptions, deufaultOptions } from './options';
import { AggregatorStorage } from './storages/aggregator-storage';
import axios from 'axios';
import { Strategy } from './types/strategy';

export class Auth {
    public storage: AggregatorStorage;
    private strategies: Record<string, Strategy> = {};
    public httpClient = axios;

    constructor(authOptions: AuthOptions) {
        const options: AuthOptions = { ...deufaultOptions, ...authOptions };

        this.storage = new AggregatorStorage(options.storages);
        options.strategies.forEach((scheme) => {
            this.strategies[scheme.strategyOptions.name] = new scheme.strategy(
                this,
                scheme.strategyOptions,
            );
        });
    }

    loginWith(name: string): void {}

    reset(): void {}
}
