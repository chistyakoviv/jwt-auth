import { Auth } from '../auth';
import { RequestController } from '../controllers/request-controller';
import { Token } from '../tokens/token';
import { HttpRequest, HttpResponse } from '../types/http';
import type {
    EndpointsOption,
    StrategyCheck,
    TokenableStrategy,
    TokenableStrategyOptions,
    UserOptions,
} from '../types/strategy';
import { getProp } from '../utils';
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
    implements TokenableStrategy
{
    private interceptor;
    public token: Token;
    public requestController: RequestController;

    constructor(public readonly auth: Auth, public readonly options: OptionsT) {
        super(auth, { ...DEFAULTS, ...options });

        this.token = new Token(this, this.auth.storage);
        this.requestController = new RequestController(this);
    }

    async login(
        params: HttpRequest,
        { reset = true } = {},
    ): Promise<HttpResponse | void> {
        if (!this.options.endpoints.login) {
            return;
        }

        if (reset) {
            this.auth.reset({ resetInterceptor: false });
        }

        if (this.options.clientId) {
            params.data.client_id = this.options.clientId;
        }

        if (this.options.grantType) {
            params.data.grant_type = this.options.grantType;
        }

        if (this.options.scope) {
            params.data.scope = this.options.scope;
        }

        const reqeustData = { ...params, ...this.options.endpoints.login };
        const response = await this.auth.httpClient.request(reqeustData);

        this.updateTokens(response);

        if (!this.interceptor) {
            this.initializeRequestInterceptor();
        }

        if (this.options.user.autoFetch) {
            await this.fetchUser();
        }

        return response;
    }

    async logout(): Promise<void> {
        return Promise.resolve();
    }

    async fetchUser(): Promise<HttpResponse | void> {
        return Promise.resolve();
    }

    reset(): void {
        return;
    }

    check(checkStatus: boolean): StrategyCheck {}

    protected updateTokens(response: HttpResponse): void {
        const token = this.options.token.required
            ? (getProp(response.data, this.options.token.property) as string)
            : true;

        this.token.set(token);
    }

    protected initializeRequestInterceptor(): void {
        return;
    }
}
