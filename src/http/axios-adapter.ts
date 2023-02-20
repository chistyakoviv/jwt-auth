import { HTTPClient, HTTPRequest, HTTPResponse } from '../types/http';
import axios, { AxiosStatic } from 'axios';

export class AxiosAdapter implements HTTPClient {
    private axios: AxiosStatic;

    constructor(axiosInstance?: AxiosStatic) {
        this.axios = axiosInstance ? axiosInstance : axios;
    }

    request(params: HTTPRequest): Promise<HTTPResponse> {
        return this.axios.request(params);
    }

    injectRequestInterceptor(fn: (config: any) => any): number {
        return this.axios.interceptors.request.use(fn);
    }

    ejectRequestInterceptor(id: number): void {
        return this.axios.interceptors.request.eject(id);
    }

    setHeader(name: string, value: string | boolean): void {
        this.axios.defaults.headers.common[name] = value;
    }

    hasHeader(name: string): boolean {
        return Boolean(this.axios.defaults.headers.common[name]);
    }
}
