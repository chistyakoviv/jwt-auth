import { Auth } from '../auth';
import { HttpRequest, HttpResponse } from '../types/http';
import { Strategy, StrategyOptions } from '../types/strategy';

export class BaseStrategy<OptionsT extends StrategyOptions>
    implements Strategy
{
    constructor(
        public readonly auth: Auth,
        public readonly options: OptionsT,
    ) {}

    async login(
        params: HttpRequest,
        { reset = true } = {},
    ): Promise<HttpResponse | void> {
        return Promise.resolve();
    }

    async fetchUser(): Promise<HttpResponse | void> {
        return Promise.resolve();
    }
}
