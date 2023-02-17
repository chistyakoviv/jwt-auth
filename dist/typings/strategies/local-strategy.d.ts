import { Auth } from '../auth';
import { RequestController } from '../http/request-controller';
import { Token } from '../tokens/token';
import { HTTPRequest, HTTPResponse } from '../types/http';
import type { EndpointsOption, StrategyCheck, TokenableStrategy, TokenableStrategyOptions, UserOptions } from '../types/strategy';
export interface LocalStrategyEndpoints extends EndpointsOption {
    login: HTTPRequest;
    logout: HTTPRequest | false;
    user: HTTPRequest | false;
}
export interface LocalStrategyOptions extends TokenableStrategyOptions {
    endpoints: LocalStrategyEndpoints;
    user: UserOptions;
    clientId: string | false;
    grantType: string | false;
    scope: string[] | false;
}
export declare const DEFAULTS: LocalStrategyOptions;
export declare class LocalStrategy<OptionsT extends LocalStrategyOptions> implements TokenableStrategy {
    readonly auth: Auth;
    readonly options: OptionsT;
    readonly token: Token;
    readonly requestController: RequestController;
    constructor(auth: Auth, options: OptionsT);
    init(): Promise<HTTPResponse | void>;
    check(checkStatus?: boolean): StrategyCheck;
    login(endpoint: HTTPRequest, { reset }?: {
        reset?: boolean | undefined;
    }): Promise<HTTPResponse | void>;
    setUserToken(token: string): Promise<HTTPResponse | void>;
    fetchUser(endpoint?: HTTPRequest): Promise<HTTPResponse | void>;
    logout(endpoint?: HTTPRequest): Promise<void>;
    reset({ resetInterceptor }?: {
        resetInterceptor?: boolean | undefined;
    }): void;
    protected updateTokens(response: HTTPResponse): void;
    protected initializeRequestInterceptor(): void;
}
