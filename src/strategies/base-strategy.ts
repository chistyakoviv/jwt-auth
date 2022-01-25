import { Auth } from '../auth';
import { HttpRequest, HttpResponse } from '../types/http';
import { Strategy, StrategyCheck, StrategyOptions } from '../types/strategy';

export class BaseStrategy<OptionsT extends StrategyOptions>
    implements Strategy
{
    constructor(
        public readonly auth: Auth,
        public readonly options: OptionsT,
    ) {}

    init(): Promise<HttpResponse | void> {
        return Promise.resolve();
    }

    async login(...args: unknown[]): Promise<HttpResponse | void> {
        return Promise.resolve();
    }

    async fetchUser(): Promise<HttpResponse | void> {
        return Promise.resolve();
    }

    reset(): void {
        return;
    }

    check(checkStatus: boolean): StrategyCheck {
        return { valid: false };
    }

    logout(endpoint?: HttpRequest): void | Promise<void> {
        return;
    }
}
