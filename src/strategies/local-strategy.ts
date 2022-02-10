import { Auth } from '../auth';
import { RequestController } from '../http/request-controller';
import { Token } from '../tokens/token';
import { HTTPRequest, HTTPResponse } from '../types/http';
import type {
    EndpointsOption,
    StrategyCheck,
    TokenableStrategy,
    TokenableStrategyOptions,
    UserOptions,
} from '../types/strategy';
import { getProp, merge } from '../utils';

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

export const DEFAULTS: LocalStrategyOptions = {
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
    implements TokenableStrategy
{
    public readonly options: OptionsT;
    public readonly token: Token;
    public readonly requestController: RequestController;

    constructor(public readonly auth: Auth, options: OptionsT) {
        this.options = merge(options, DEFAULTS);
        this.token = new Token(this, this.auth.storage);
        this.requestController = new RequestController(this);
    }

    init(): Promise<HTTPResponse | void> {
        this.initializeRequestInterceptor();

        return this.auth.fetchUserOnce();
    }

    check(checkStatus = false): StrategyCheck {
        const response = {
            valid: false,
            tokenExpired: false,
        };

        const token = this.token.sync();

        if (!token) {
            return response;
        }

        if (!checkStatus) {
            response.valid = true;
            return response;
        }

        const tokenStatus = this.token.status();

        if (tokenStatus.expired()) {
            response.tokenExpired = true;
            return response;
        }

        response.valid = true;
        return response;
    }

    async login(
        endpoint: HTTPRequest,
        { reset = true } = {},
    ): Promise<HTTPResponse | void> {
        if (!this.options.endpoints.login) {
            return;
        }

        if (reset) {
            this.auth.reset({ resetInterceptor: false });
        }

        if (this.options.clientId) {
            endpoint.data.client_id = this.options.clientId;
        }

        if (this.options.grantType) {
            endpoint.data.grant_type = this.options.grantType;
        }

        if (this.options.scope) {
            endpoint.data.scope = this.options.scope;
        }

        const reqeustData = { ...this.options.endpoints.login, ...endpoint };
        const response = await this.auth.httpClient.request(reqeustData);

        this.updateTokens(response);

        if (this.options.user.autoFetch) {
            await this.fetchUser();
        }

        return response;
    }

    setUserToken(token: string): Promise<HTTPResponse | void> {
        this.token.set(token);

        return this.fetchUser();
    }

    fetchUser(endpoint?: HTTPRequest): Promise<HTTPResponse | void> {
        if (!this.check().valid) {
            return Promise.resolve();
        }

        // User endpoint is disabled
        if (!this.options.endpoints.user) {
            this.auth.setUser({});
            return Promise.resolve();
        }

        const reqeustData = { ...this.options.endpoints.user, ...endpoint };

        // Try to fetch user and then set
        return this.auth.httpClient
            .request(reqeustData)
            .then((response: HTTPResponse) => {
                const userData = getProp(
                    response.data,
                    this.options.user.property,
                );

                if (!userData) {
                    const error = new Error(
                        `User Data response does not contain field ${this.options.user.property}`,
                    );
                    return Promise.reject(error);
                }

                this.auth.setUser(userData);
                return response;
            })
            .catch((error: any) => {
                this.auth.callOnError(error, { method: 'fetchUser' });
                return Promise.reject(error);
            });
    }

    async logout(endpoint: HTTPRequest = {}): Promise<void> {
        const reqeustData = { ...this.options.endpoints.logout, ...endpoint };

        if (this.options.endpoints.logout) {
            await this.auth.httpClient.request(reqeustData);
        }

        return this.auth.reset();
    }

    reset({ resetInterceptor = true } = {}): void {
        this.auth.setUser(false);
        this.token.reset();

        if (resetInterceptor) {
            this.requestController.reset();
        }
    }

    protected updateTokens(response: HTTPResponse): void {
        const token = this.options.token.required
            ? (getProp(response.data, this.options.token.property) as string)
            : true;

        this.token.set(token);
    }

    protected initializeRequestInterceptor(): void {
        this.requestController.initializeRequestInterceptor();
    }
}
