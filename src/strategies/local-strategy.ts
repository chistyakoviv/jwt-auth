import { Auth } from '../auth';
import { HttpRequest, HttpResponse } from '../types/http';
import {
    EndpointsOption,
    IStrategy,
    TokenableStrategyOptions,
    UserOptions,
} from '../types/strategy';
import { BaseStrategy } from './base-strategy';

export interface LocalStrategyEndpoints extends EndpointsOption {
    login: HttpRequest;
    logout: HttpRequest | false;
    user: HttpRequest | false;
}

export interface LocalStrategyOptions extends TokenableStrategyOptions {
    endpoints: LocalStrategyEndpoints;
    user: UserOptions;
    clientId: string | false;
    grantType: string | false;
    scope: string[] | false;
}

const DEFAULTS: LocalStrategyOptions = {
    name: 'local',
    endpoints: {
        login: {
            url: '/api/auth/login',
            method: 'post',
        },
        logout: {
            url: '/api/auth/logout',
            method: 'post',
        },
        user: {
            url: '/api/auth/user',
            method: 'get',
        },
    },
    token: {
        property: 'token',
        type: 'Bearer',
        name: 'Authorization',
        maxAge: 1800,
        global: true,
        required: true,
        prefix: '_token.',
        expirationPrefix: '_token_expiration.',
    },
    user: {
        property: 'user',
        autoFetch: true,
    },
    clientId: false,
    grantType: false,
    scope: false,
};

export class LocalStrategy<OptionsT extends LocalStrategyOptions>
    extends BaseStrategy<OptionsT>
    implements IStrategy
{
    constructor(protected readonly auth: Auth, options: OptionsT) {
        super(auth, { ...DEFAULTS, ...options });
    }

    async login(params: HttpRequest): Promise<HttpResponse> {
        const reqeustData = { ...params, ...this.options.endpoints.login };
        const response = await this.auth.http.request(reqeustData);

        this.updateTokens(response);
    }

    async logout(): Promise<void> {
        return Promise.resolve();
    }

    async fetchUser(): Promise<HttpResponse> {
        return Promise.resolve();
    }

    reset(): void {
        return;
    }

    private updateTokens(response: HttpResponse): void {
        return;
    }
}
