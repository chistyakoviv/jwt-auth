import { Auth } from '../auth';
import { HTTPRequest, HTTPResponse } from '../types/http';
import { Strategy, StrategyCheck, StrategyOptions } from '../types/strategy';

export class BaseStrategy<OptionsT extends StrategyOptions>
    implements Strategy
{
    constructor(
        public readonly auth: Auth,
        public readonly options: OptionsT,
    ) {}

    init(): Promise<HTTPResponse | void> {
        return Promise.resolve();
    }

    async login(...args: unknown[]): Promise<HTTPResponse | void> {
        return Promise.resolve();
    }

    async fetchUser(): Promise<HTTPResponse | void> {
        return Promise.resolve();
    }

    reset(): void {
        return;
    }

    check(checkStatus: boolean): StrategyCheck {
        return { valid: false };
    }

    logout(endpoint?: HTTPRequest): void | Promise<void> {
        return;
    }
}
