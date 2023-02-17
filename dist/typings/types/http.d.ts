import type { AxiosRequestConfig, AxiosResponse } from 'axios';
export declare type HTTPRequest = AxiosRequestConfig;
export declare type HTTPResponse = AxiosResponse;
export interface HTTPClient {
    request(params: HTTPRequest): Promise<HTTPResponse>;
    injectRequestInterceptor(fn: (config: any) => void): number;
    ejectRequestInterceptor(id: number): void;
    setHeader(name: string, value: string | boolean): void;
    hasHeader(name: string): boolean;
}
