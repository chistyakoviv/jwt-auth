import type { TokenableStrategy, RefreshableStrategy } from '../types/strategy';
import { ExpiredAuthSessionError } from '../errors/expired-auth-session-error';

export class RequestController {
    public strategy: TokenableStrategy | RefreshableStrategy;
    private interceptor: number | null;
    private httpClient;

    constructor(strategy: TokenableStrategy | RefreshableStrategy) {
        this.strategy = strategy;
        this.httpClient = this.strategy.auth.httpClient;
        this.interceptor = null;
    }

    setHeader(token: string): void {
        if (this.strategy.options.token.global) {
            this.httpClient.defaults.headers.common[
                this.strategy.options.token.name
            ] = token;
        }
    }

    clearHeader(): void {
        if (this.strategy.options.token.global) {
            this.httpClient.defaults.headers.common[
                this.strategy.options.token.name
            ] = false;
        }
    }

    initializeRequestInterceptor(refreshEndpoint?: string): void {
        this.interceptor = this.httpClient.interceptors.request.use(
            async (config: any) => {
                // Don't intercept refresh token requests
                if (
                    !this._needToken(config) ||
                    config.url === refreshEndpoint
                ) {
                    return config;
                }

                const {
                    valid,
                    tokenExpired,
                    refreshTokenExpired,
                    isRefreshable,
                } = this.strategy.check(true);
                let isValid = valid;

                // Refresh token has expired. There is no way to refresh. Force reset.
                if (refreshTokenExpired) {
                    this.strategy.reset();
                    throw new ExpiredAuthSessionError();
                }

                // Token has expired.
                if (tokenExpired) {
                    // Refresh token is not available. Force reset.
                    if (!isRefreshable) {
                        this.strategy.reset();
                        throw new ExpiredAuthSessionError();
                    }

                    // Refresh token is available. Attempt refresh.
                    isValid = await (this.strategy as RefreshableStrategy)
                        .refreshTokens()
                        .then(() => true)
                        .catch(() => {
                            // Tokens couldn't be refreshed. Force reset.
                            this.strategy.reset();
                            throw new ExpiredAuthSessionError();
                        });
                }

                const token = this.strategy.token.get();

                if (!isValid) {
                    // The authorization header in the current request is expired.
                    // Token was deleted right before this request
                    if (!token && this._requestHasAuthorizationHeader(config)) {
                        throw new ExpiredAuthSessionError();
                    }

                    return config;
                }

                return this._getUpdatedRequestConfig(config, token);
            },
        );
    }

    reset(): void {
        this.httpClient.interceptors.request.eject(this.interceptor as number);
        this.interceptor = null;
    }

    private _needToken(config: any): boolean {
        const options = this.strategy.options;
        return (
            options.token.global ||
            Object.values(options.endpoints).some((endpoint: any): boolean => {
                return typeof endpoint === 'object'
                    ? endpoint.url === config.url
                    : endpoint === config.url;
            })
        );
    }

    private _getUpdatedRequestConfig(config: any, token: string | boolean) {
        if (typeof token === 'string') {
            config.headers[this.strategy.options.token.name] = token;
        }

        return config;
    }

    private _requestHasAuthorizationHeader(config: any): boolean {
        return !!config.headers.common[this.strategy.options.token.name];
    }
}
