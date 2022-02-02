import { HTTPRequest, HTTPResponse } from './http';
import { Token } from '../tokens/token';
import { RefreshToken } from '../tokens/refresh-token';
import { RequestController } from '../http/request-controller';
import { RefreshController } from '../http/refresh-controller';
import { Auth } from '../auth';

export interface UserOptions {
    property: string | false;
    autoFetch: boolean;
}

export interface EndpointsOption {
    [endpoint: string]: string | HTTPRequest | false;
}

export interface TokenOptions {
    property: string;
    type: string | false;
    name: string;
    maxAge: number | false;
    global: boolean;
    required: boolean;
    prefix: string;
    expirationPrefix: string;
}

export interface TokenableStrategyOptions {
    token: TokenOptions;
    endpoints: EndpointsOption;
}

export interface StrategyOptions {
    name: string;
}

export interface TokenableStrategyOptions extends StrategyOptions {
    token: TokenOptions;
    endpoints: EndpointsOption;
}

export interface TokenableStrategy<
    OptionsT extends TokenableStrategyOptions = TokenableStrategyOptions,
> extends Strategy<OptionsT> {
    token: Token;
    requestController: RequestController;
}

export interface RefreshTokenOptions {
    property: string | false;
    type: string | false;
    data: string | false;
    maxAge: number | false;
    required: boolean;
    tokenRequired: boolean;
    prefix: string;
    expirationPrefix: string;
}

export interface RefreshableStrategyOptions extends TokenableStrategyOptions {
    refreshToken: RefreshTokenOptions;
}

export interface StrategyCheck {
    valid: boolean;
    tokenExpired?: boolean;
    refreshTokenExpired?: boolean;
    isRefreshable?: boolean;
}

export interface Strategy<OptionsT extends StrategyOptions = StrategyOptions> {
    auth: Auth;
    options: OptionsT;
    check(checkStatus: boolean): StrategyCheck;
    login(...args: any[]): Promise<HTTPResponse | void>;
    fetchUser(endpoint?: HTTPRequest): Promise<HTTPResponse | void>;
    setUserToken?(
        token: string | boolean,
        refreshToken?: string | boolean,
    ): Promise<HTTPResponse | void>;
    init(): Promise<HTTPResponse | void>;
    logout(endpoint?: HTTPRequest): Promise<void> | void;
    reset(options?: { resetInterceptor: boolean }): void;
}

export interface RefreshableStrategy<
    OptionsT extends RefreshableStrategyOptions = RefreshableStrategyOptions,
> extends TokenableStrategy<OptionsT> {
    refreshToken: RefreshToken;
    refreshController: RefreshController;
    refreshTokens(): Promise<HTTPResponse | void>;
}
