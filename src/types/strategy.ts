import { HttpRequest, HttpResponse } from './http';
import { Token } from '../tokens/token';
import { RefreshToken } from '../tokens/refresh-token';
import { RequestController } from '../controllers/request-controller';
import { RefreshController } from '../controllers/refresh-controller';
import { Auth } from '../auth';

export interface UserOptions {
    property: string | false;
    autoFetch: boolean;
}

export interface EndpointsOption {
    [endpoint: string]: string | HttpRequest | false;
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
    reset(options?: { resetInterceptor: boolean }): void;
    check(checkStatus: boolean): StrategyCheck;
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
    check?(checkStatus: boolean): StrategyCheck;
    login(...args: unknown[]): Promise<HttpResponse | void>;
    fetchUser(endpoint?: HttpRequest): Promise<HttpResponse | void>;
    setUserToken?(
        token: string | boolean,
        refreshToken?: string | boolean,
    ): Promise<HttpResponse | void>;
    logout?(endpoint?: HttpRequest): Promise<void> | void;
    reset?(options?: { resetInterceptor: boolean }): void;
}

export interface RefreshableStrategy<
    OptionsT extends RefreshableStrategyOptions = RefreshableStrategyOptions,
> extends TokenableStrategy<OptionsT> {
    refreshToken: RefreshToken;
    refreshController: RefreshController;
    refreshTokens(): Promise<HttpResponse | void>;
    reset(options?: { resetInterceptor: boolean }): void;
    check(checkStatus: boolean): StrategyCheck;
}
