import { AuthOptions } from './options';
import { StorageAggregator } from './storages/storage-aggregator';

export class auth {
    private storage: StorageAggregator;

    constructor(private readonly axios, private readonly options: AuthOptions) {
        this.storage = new StorageAggregator(options.storages);
    }
}
