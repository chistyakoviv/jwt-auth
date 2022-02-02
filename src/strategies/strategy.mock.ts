import { LocalStrategy, LocalStrategyOptions } from './local-strategy';
import { requestControllerMock } from '../http/request-controller.mock';

export * from '../http/request-controller.mock';
export const mockInit = jest.fn();
export const mockLogin = jest.fn();
export const mockFetchUser = jest.fn();
export const mockReset = jest.fn();
export const mockCheck = jest.fn();
export const mockLogout = jest.fn();
export const mockAuth = jest.fn();
export const mockRequestController = jest.fn();

export const DEFAULTS: LocalStrategyOptions = {
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

export const StrategyMock = jest.fn().mockImplementation((options) => {
    return {
        auth: mockAuth,
        requestController: requestControllerMock,
        options: { ...DEFAULTS, ...options },

        init: mockInit,
        login: mockLogin,
        fetchUser: mockFetchUser,
        reset: mockReset,
        check: mockCheck,
        logout: mockLogout,
    };
}) as jest.MockedClass<typeof LocalStrategy>;
