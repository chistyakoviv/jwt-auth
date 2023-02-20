import { HTTPClient, HTTPRequest, HTTPResponse } from '../types/http';
import { AxiosStatic } from 'axios';
export declare class AxiosAdapter implements HTTPClient {
    private axios;
    constructor(axiosInstance?: AxiosStatic);
    request(params: HTTPRequest): Promise<HTTPResponse>;
    injectRequestInterceptor(fn: (config: any) => any): number;
    ejectRequestInterceptor(id: number): void;
    setHeader(name: string, value: string | boolean): void;
    hasHeader(name: string): boolean;
}
