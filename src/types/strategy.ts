// https: github.com/nuxt-community/auth-module/blob/75c20e64cc2bb8d4db7d7fc772432132a1d9e417/src/schemes/local.ts
// auth -> strategies (schemes) -> tokens

import { Auth } from '../auth';
import { HttpRequest, HttpResponse } from './http';

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

export interface IStrategy {
    login(): Promise<HttpResponse>;

    logout(): Promise<void>;

    fetchUser(): Promise<HttpResponse>;

    reset(): void;
}
