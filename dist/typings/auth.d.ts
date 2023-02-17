import { AuthOptions } from './options';
import { AggregatorStorage } from './storages/aggregator-storage';
import { Strategy, StrategyCheck } from './types/strategy';
import { HTTPClient, HTTPResponse } from './types/http';
export declare type ErrorListener = (...args: unknown[]) => void;
export declare class Auth {
    private strategies;
    private state;
    private defaultStrategy;
    private errorListeners;
    httpClient: HTTPClient;
    storage: AggregatorStorage;
    constructor(authOptions: AuthOptions);
    init(): Promise<HTTPResponse | void>;
    getStrategy(throwException?: boolean): Strategy;
    setStrategy(name: string): void;
    loginWith(name: string, ...args: any[]): Promise<HTTPResponse | void>;
    login(...args: any[]): Promise<HTTPResponse | void>;
    fetchUser(...args: any[]): Promise<HTTPResponse | void>;
    logout(...args: any[]): Promise<void>;
    reset(...args: any[]): void;
    check(...args: any[]): StrategyCheck;
    fetchUserOnce(...args: any[]): Promise<HTTPResponse | void>;
    setUser(user: any): void;
    onError(listener: ErrorListener): void;
    callOnError(error: Error, payload?: {}): void;
    private setState;
}
