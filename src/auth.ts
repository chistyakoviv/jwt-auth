import { AuthOptions, deufaultOptions } from './options';
import { AggregatorStorage } from './storages/aggregator-storage';
import axios from 'axios';
import { Strategy, StrategyCheck } from './types/strategy';
import { HttpResponse } from './types/http';

export type ErrorListener = (...args: unknown[]) => void;

export class Auth {
    private strategies: Record<string, Strategy> = {};
    private state: Record<string, any> = { user: null, loggedIn: false };
    private defaultStrategy: string;
    private errorListeners: ErrorListener[] = [];

    public httpClient = axios;
    public storage: AggregatorStorage;

    constructor(authOptions: AuthOptions) {
        const options: AuthOptions = { ...deufaultOptions, ...authOptions };

        this.storage = new AggregatorStorage(
            options.storages.map((s) => new s.storage(s.storageOptions)),
        );
        options.strategies.forEach((s) => {
            this.strategies[s.strategyOptions.name] = new s.strategy(
                this,
                s.strategyOptions,
            );
        });
        this.defaultStrategy =
            options.defaultStrategy || options.strategies.length
                ? options.strategies[0].strategyOptions.name
                : '';

        // this.init();
    }

    init(): Promise<HttpResponse | void> {
        this.storage.sync('strategy');

        // Set default strategy if current one is invalid
        if (!this.getStrategy(false)) {
            this.storage.set('strategy', this.defaultStrategy);

            if (!this.getStrategy(false)) {
                return Promise.resolve();
            }
        }

        return this.getStrategy().init();
    }

    getStrategy(throwException = true): Strategy {
        const strategy = this.storage.get('strategy') as string;
        if (throwException) {
            if (!strategy) {
                throw new Error('No strategy is set!');
            }
            if (!this.strategies[strategy]) {
                throw new Error('Strategy not supported: ' + strategy);
            }
        }
        return this.strategies[strategy];
    }

    setStrategy(name: string): Promise<HttpResponse | void> {
        if (name === this.storage.get('strategy')) {
            return Promise.resolve();
        }

        if (!this.strategies[name]) {
            throw new Error(`Strategy ${name} is not defined!`);
        }

        this.reset();
        this.storage.set('strategy', name);

        return Promise.resolve();
    }

    loginWith(name: string, ...args: any[]): Promise<HttpResponse | void> {
        return this.setStrategy(name).then(() => this.login(...args));
    }

    login(...args: any[]): Promise<HttpResponse | void> {
        if (!this.getStrategy().login) {
            return Promise.resolve();
        }

        return this.getStrategy()
            .login(...args)
            .catch((error) => {
                this.callOnError(error, { method: 'login' });
                return Promise.reject(error);
            });
    }

    fetchUser(...args: any[]): Promise<HttpResponse | void> {
        if (!this.getStrategy().fetchUser) {
            return Promise.resolve();
        }

        return Promise.resolve(this.getStrategy().fetchUser(...args)).catch(
            (error) => {
                this.callOnError(error, { method: 'fetchUser' });
                return Promise.reject(error);
            },
        );
    }

    logout(...args: any[]): Promise<void> {
        if (!this.getStrategy().logout) {
            this.reset();
            return Promise.resolve();
        }

        return Promise.resolve(this.getStrategy().logout(...args)).catch(
            (error) => {
                this.callOnError(error, { method: 'logout' });
                return Promise.reject(error);
            },
        );
    }

    reset(...args: any[]): void {
        return this.getStrategy().reset(
            ...(args as [options?: { resetInterceptor: boolean }]),
        );
    }

    check(...args: any[]): StrategyCheck {
        return this.getStrategy().check(...(args as [checkStatus: boolean]));
    }

    fetchUserOnce(...args: any[]): Promise<HttpResponse | void> {
        if (!this.state.user) {
            return this.fetchUser(...args);
        }
        return Promise.resolve();
    }

    setUser(user: any): void {
        this.setState({ user });

        let check = { valid: Boolean(user) };

        // If user is defined, perform scheme checks.
        if (check.valid) {
            check = this.check();
        }

        this.setState({ loggedIn: check.valid });
    }

    setState(state: Record<string, any>): void {
        Object.assign(this.state, state);
    }

    onError(listener: ErrorListener): void {
        this.errorListeners.push(listener);
    }

    callOnError(error: Error, payload = {}): void {
        for (const fn of this.errorListeners) {
            fn(error, payload);
        }
    }
}
