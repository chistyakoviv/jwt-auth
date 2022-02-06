import axios from 'axios';
import { HTTPRequest } from '../types/http';
import { AxiosAdapter } from './axios-adapter';

const mockRequest = jest.fn();
const mockUse = jest.fn();
const mockEject = jest.fn();

jest.mock('axios', () => {
    return {
        default: {
            request: jest
                .fn()
                .mockImplementation((...args) => mockRequest(...args)),
            interceptors: {
                request: {
                    use: jest
                        .fn()
                        .mockImplementation((...args) => mockUse(...args)),
                    eject: jest
                        .fn()
                        .mockImplementation((...args) => mockEject(...args)),
                },
            },
            defaults: {
                headers: {
                    common: {},
                },
            },
        },
    };
});

describe('Axios adapter', () => {
    let httpClient: AxiosAdapter;

    beforeEach(() => {
        httpClient = new AxiosAdapter();
        mockRequest.mockClear();
        mockUse.mockClear();
        mockEject.mockClear();
        axios.defaults.headers.common = {};
    });

    it('Makes request', async () => {
        const requestParams: HTTPRequest = {
            url: '/some/url',
            method: 'get',
        };

        mockRequest.mockResolvedValue({ status: 200 });

        const result = await httpClient.request(requestParams);

        expect(mockRequest).toHaveBeenCalledWith({
            url: '/some/url',
            method: 'get',
        });
        expect(result).toStrictEqual({ status: 200 });
    });

    it('Ijects interceptor', () => {
        const interceptor = (config: any) => config;

        mockUse.mockReturnValue(42);

        const result = httpClient.injectRequestInterceptor(interceptor);

        expect(mockUse).toHaveBeenCalledWith(interceptor);
        expect(result).toBe(42);
    });

    it('Ejects interceptor', () => {
        httpClient.ejectRequestInterceptor(42);

        expect(mockEject).toHaveBeenCalledWith(42);
    });

    it('Sets header', () => {
        httpClient.setHeader('header', 'test');

        expect(axios.defaults.headers.common).toStrictEqual({ header: 'test' });
    });

    it('Checks if header is set', () => {
        httpClient.setHeader('authorization', 'token_value');

        const result = httpClient.hasHeader('authorization');

        expect(result).toBe(true);
    });

    it('Checks if header is not set', () => {
        const result = httpClient.hasHeader('authorization');

        expect(result).toBe(false);
    });
});
