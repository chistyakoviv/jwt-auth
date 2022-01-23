import { AuthOptions } from './options';
import { AggregatorStorage } from './storages/aggregator-storage';
import axios from 'axios';
import { IStrategy } from './types/strategy';

export class Auth {
    private storage: AggregatorStorage;
    private strategies: Record<string, IStrategy> = {};
    public http = axios;

    constructor(private readonly options: AuthOptions) {
        this.storage = new AggregatorStorage(options.storages);
        options.strategies.forEach((scheme) => {
            this.strategies[scheme.strategyOptions.name] = new scheme.strategy(
                this,
                scheme.strategyOptions,
            );
        });
    }
}
