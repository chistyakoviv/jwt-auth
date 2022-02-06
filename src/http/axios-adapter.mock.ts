import { AxiosAdapter } from './axios-adapter';

export const mockRequest = jest.fn();
export const mockInjectRequestInterceptor = jest.fn();
export const mockEjectRequestInterceptor = jest.fn();
export const mockSetHeader = jest.fn();
export const mockHasHeader = jest.fn();

export const AxiosAdapterMock = jest.fn().mockImplementation(() => {
    return {
        request: mockRequest,
        injectRequestInterceptor: mockInjectRequestInterceptor,
        ejectRequestInterceptor: mockEjectRequestInterceptor,
        setHeader: mockSetHeader,
        hasHeader: mockHasHeader,
    };
}) as jest.MockedClass<typeof AxiosAdapter>;
