import { Auth } from '../auth';
import { HTTPRequest, HTTPResponse } from '../types/http';
import type { StrategyCheck, RefreshableStrategy, RefreshableStrategyOptions, StrategyPartialOptions } from '../types/strategy';
import { RefreshController } from '../http/refresh-controller';
import { RefreshToken } from '../tokens/refresh-token';
import { LocalStrategy, LocalStrategyEndpoints, LocalStrategyOptions } from './local-strategy';
export interface RefreshStrategyEndpoints extends LocalStrategyEndpoints {
    refresh: HTTPRequest;
}
export interface RefreshStrategyOptions extends LocalStrategyOptions, RefreshableStrategyOptions {
    endpoints: RefreshStrategyEndpoints;
    autoLogout: boolean;
}
export declare const REFRESH_STRATEGY_DEFAULTS: StrategyPartialOptions<RefreshStrategyOptions>;
export declare class RefreshStrategy<OptionsT extends RefreshStrategyOptions> extends LocalStrategy<OptionsT> implements RefreshableStrategy<OptionsT> {
    readonly auth: Auth;
    refreshToken: RefreshToken;
    refreshController: RefreshController;
    constructor(auth: Auth, options: OptionsT);
    check(checkStatus?: boolean): StrategyCheck;
    refreshTokens(): Promise<HTTPResponse | void>;
    setUserToken(token: string | boolean, refreshToken?: string | boolean): Promise<HTTPResponse | void>;
    reset({ resetInterceptor }?: {
        resetInterceptor?: boolean | undefined;
    }): void;
    protected updateTokens(response: HTTPResponse, { isRefreshing, updateOnRefresh }?: {
        isRefreshing?: boolean | undefined;
        updateOnRefresh?: boolean | undefined;
    }): void;
    protected initializeRequestInterceptor(): void;
}
