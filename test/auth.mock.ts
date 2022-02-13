export * from '../test/http/axios-adapter.mock';
import { Auth } from '../src/auth';
import { AxiosAdapterMock } from '../test/http/axios-adapter.mock';

export const mockInit = jest.fn();
export const mockGetStrategy = jest.fn();
export const mockSetStrategy = jest.fn();
export const mockLoginWith = jest.fn();
export const mockLogin = jest.fn();
export const mockFetchUser = jest.fn();
export const mockLogout = jest.fn();
export const mockReset = jest.fn();
export const mockCheck = jest.fn();
export const mockFetchUserOnce = jest.fn();
export const mockSetUser = jest.fn();
export const mockSetState = jest.fn();
export const mockOnError = jest.fn();
export const mockCallOnError = jest.fn();

export const AuthMock = jest.fn().mockImplementation(() => {
    return {
        httpClient: new AxiosAdapterMock(),
        init: mockInit,
        getStrategy: mockGetStrategy,
        setStrategy: mockSetStrategy,
        loginWith: mockLoginWith,
        login: mockLogin,
        fetchUser: mockFetchUser,
        logout: mockLogout,
        reset: mockReset,
        check: mockCheck,
        fetchUserOnce: mockFetchUserOnce,
        setUser: mockSetUser,
        setState: mockSetState,
        onError: mockOnError,
        callOnError: mockCallOnError,
    };
}) as jest.MockedClass<typeof Auth>;
