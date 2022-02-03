import { LocalStrategy, DEFAULTS } from './local-strategy';
import { requestControllerMock } from '../http/request-controller.mock';

export * from '../http/request-controller.mock';
export { DEFAULTS } from './local-strategy';
export const mockInit = jest.fn();
export const mockLogin = jest.fn();
export const mockFetchUser = jest.fn();
export const mockReset = jest.fn();
export const mockCheck = jest.fn();
export const mockLogout = jest.fn();
export const mockAuth = jest.fn();
export const mockRequestController = jest.fn();

export const LocalStrategyMock = jest.fn().mockImplementation((options) => {
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
