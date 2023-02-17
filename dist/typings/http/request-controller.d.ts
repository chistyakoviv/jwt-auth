import type { TokenableStrategy, RefreshableStrategy } from '../types/strategy';
export declare class RequestController {
    strategy: TokenableStrategy | RefreshableStrategy;
    interceptor: number | null;
    httpClient: import("../auth").HTTPClient;
    constructor(strategy: TokenableStrategy | RefreshableStrategy);
    setHeader(token: string): void;
    clearHeader(): void;
    initializeRequestInterceptor(refreshEndpoint?: string): void;
    reset(): void;
    private _needToken;
    private _getUpdatedRequestConfig;
}
