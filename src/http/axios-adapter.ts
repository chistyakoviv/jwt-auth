import { HTTPClient, HTTPRequest, HTTPResponse } from '../types/http';
import axios from 'axios';

export class AxiosAdapter implements HTTPClient {
    request(params: HTTPRequest): Promise<HTTPResponse> {
        return axios.request(params);
    }

    injectRequestInterceptor(fn: (config: any) => void): number {
        return axios.interceptors.request.use(fn);
    }

    ejectRequestInterceptor(id: number): void {
        return axios.interceptors.request.eject(id);
    }

    setHeader(name: string, value: string | boolean): void {
        axios.defaults.headers.common[name] = value;
    }

    hasHeader(name: string): boolean {
        return Boolean(axios.defaults.headers.common[name]);
    }
}
