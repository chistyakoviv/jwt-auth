import { Auth } from '../auth';
import { HTTPRequest, HTTPResponse } from '../types/http';
import type {
    StrategyCheck,
    RefreshableStrategy,
    RefreshableStrategyOptions,
    StrategyPartialOptions,
} from '../types/strategy';
import { getProp, cleanObj, merge } from '../utils';
import { RefreshController } from '../http/refresh-controller';
import { RefreshToken } from '../tokens/refresh-token';
import { ExpiredAuthSessionError } from '../errors/expired-auth-session-error';
import {
    LocalStrategy,
    LocalStrategyEndpoints,
    LocalStrategyOptions,
} from './local-strategy';

export interface RefreshStrategyEndpoints extends LocalStrategyEndpoints {
    refresh: HTTPRequest;
}

export interface RefreshStrategyOptions
    extends LocalStrategyOptions,
        RefreshableStrategyOptions {
    endpoints: RefreshStrategyEndpoints;
    autoLogout: boolean;
}

export const DEFAULTS: StrategyPartialOptions<RefreshStrategyOptions> = {
    name: 'refresh',
    endpoints: {
        refresh: {
            url: '/api/auth/refresh',
            method: 'post',
        },
    },
    refreshToken: {
        property: 'refresh_token',
        data: 'refresh_token',
        maxAge: 60 * 60 * 24 * 30,
        required: true,
        tokenRequired: false,
        prefix: '_refresh_token.',
        expirationPrefix: '_refresh_token_expiration.',
    },
    autoLogout: false,
};

export class RefreshStrategy<OptionsT extends RefreshStrategyOptions>
    extends LocalStrategy<OptionsT>
    implements RefreshableStrategy<OptionsT>
{
    public refreshToken: RefreshToken;
    public refreshController: RefreshController;

    constructor(public readonly auth: Auth, options: OptionsT) {
        super(auth, merge(options, DEFAULTS));

        this.refreshToken = new RefreshToken(this, this.auth.storage);
        this.refreshController = new RefreshController(this);
    }

    check(checkStatus = false): StrategyCheck {
        const response = {
            valid: false,
            tokenExpired: false,
            refreshTokenExpired: false,
            isRefreshable: true,
        };

        const token = this.token.sync();
        const refreshToken = this.refreshToken.sync();

        // Token and refresh token are required but not available
        if (!token || !refreshToken) {
            return response;
        }

        // Check status wasn't enabled, let it pass
        if (!checkStatus) {
            response.valid = true;
            return response;
        }

        const tokenStatus = this.token.status();
        const refreshTokenStatus = this.refreshToken.status();

        // Refresh token has expired. There is no way to refresh. Force reset.
        if (refreshTokenStatus.expired()) {
            response.refreshTokenExpired = true;
            return response;
        }

        // Token has expired, Force reset.
        if (tokenStatus.expired()) {
            response.tokenExpired = true;
            return response;
        }

        response.valid = true;
        return response;
    }

    refreshTokens(): Promise<HTTPResponse | void> {
        // Refresh endpoint is disabled
        if (!this.options.endpoints.refresh) {
            return Promise.resolve();
        }

        if (!this.check().valid) {
            return Promise.resolve();
        }

        const refreshTokenStatus = this.refreshToken.status();

        // Refresh token is expired. There is no way to refresh. Force reset.
        if (refreshTokenStatus.expired()) {
            this.auth.reset();

            throw new ExpiredAuthSessionError();
        }

        // Delete current token from the request header before refreshing, if `tokenRequired` is disabled
        if (!this.options.refreshToken.tokenRequired) {
            this.requestController.clearHeader();
        }

        const endpoint: Record<string, any> = {
            data: {
                client_id: undefined,
                grant_type: undefined,
            },
        };

        // Add refresh token to payload if required
        if (
            this.options.refreshToken.required &&
            this.options.refreshToken.data
        ) {
            endpoint.data[this.options.refreshToken.data] =
                this.refreshToken.get();
        }

        if (this.options.clientId) {
            endpoint.data.client_id = this.options.clientId;
        }

        if (this.options.grantType) {
            endpoint.data.grant_type = 'refresh_token';
        }

        cleanObj(endpoint.data);

        const reqeustData = { ...this.options.endpoints.refresh, ...endpoint };

        return this.auth.httpClient
            .request(reqeustData)
            .then((response) => {
                this.updateTokens(response, { isRefreshing: true });
                return response;
            })
            .catch((error) => {
                this.auth.callOnError(error, { method: 'refreshToken' });
                return Promise.reject(error);
            });
    }

    setUserToken(
        token: string | boolean,
        refreshToken?: string | boolean,
    ): Promise<HTTPResponse | void> {
        this.token.set(token);

        if (refreshToken) {
            this.refreshToken.set(refreshToken);
        }

        return this.fetchUser();
    }

    reset({ resetInterceptor = true } = {}): void {
        this.auth.setUser(false);
        this.token.reset();
        this.refreshToken.reset();

        if (resetInterceptor) {
            this.requestController.reset();
        }
    }

    protected updateTokens(
        response: HTTPResponse,
        { isRefreshing = false, updateOnRefresh = true } = {},
    ): void {
        const token = this.options.token.required
            ? (getProp(response.data, this.options.token.property) as string)
            : true;
        const refreshToken = this.options.refreshToken.required
            ? (getProp(
                  response.data,
                  this.options.refreshToken.property,
              ) as string)
            : true;

        this.token.set(token);

        // Update refresh token if defined and if `isRefreshing` is `false`
        // If `isRefreshing` is `true`, then only update if `updateOnRefresh` is also `true`
        if (
            refreshToken &&
            (!isRefreshing || (isRefreshing && updateOnRefresh))
        ) {
            this.refreshToken.set(refreshToken);
        }
    }

    protected initializeRequestInterceptor(): void {
        this.requestController.initializeRequestInterceptor(
            this.options.endpoints.refresh.url,
        );
    }
}
