import { Auth } from '../auth';
import { HttpResponse } from '../types/http';
import { IStrategy, StrategyOptions } from '../types/strategy';

export class BaseStrategy<OptionsT extends StrategyOptions>
    implements IStrategy
{
    constructor(
        protected readonly auth: Auth,
        protected readonly options: OptionsT,
    ) {}

    async login(): Promise<HttpResponse> {
        return Promise.resolve();
    }

    async logout(): Promise<void> {
        return Promise.resolve();
    }

    async fetchUser(): Promise<HttpResponse> {
        return Promise.resolve();
    }

    reset(): void {
        return;
    }
}
