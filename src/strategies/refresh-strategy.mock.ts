import { RefreshStrategy, DEFAULTS } from './refresh-strategy';
import { DEFAULTS as LOCAL_DEFAULTS } from './local-strategy';
import { RequestControllerMock } from '../http/request-controller.mock';
import { RefreshControllerMock } from '../http/refresh-controller.mock';
import { Auth } from '../auth';

export * from '../http/request-controller.mock';
export * from '../strategies/refresh-strategy';
export { DEFAULTS } from './refresh-strategy';
export const mockInit = jest.fn();
export const mockLogin = jest.fn();
export const mockFetchUser = jest.fn();
export const mockReset = jest.fn();
export const mockCheck = jest.fn();
export const mockLogout = jest.fn();
export const mockRefreshTokens = jest.fn();
export const mockSetUserToken = jest.fn();

export const RefreshStrategyMock = jest
    .fn()
    .mockImplementation((auth: Auth, options) => {
        const strategy: any = {
            auth,
            options: { ...LOCAL_DEFAULTS, ...DEFAULTS, ...options },

            init: mockInit,
            login: mockLogin,
            fetchUser: mockFetchUser,
            reset: mockReset,
            check: mockCheck,
            logout: mockLogout,
            refreshTokens: mockRefreshTokens,
            setUserToken: mockSetUserToken,
        };
        strategy.requestController = new RequestControllerMock(strategy);
        strategy.refreshController = new RefreshControllerMock(strategy);

        return strategy;
    }) as jest.MockedClass<typeof RefreshStrategy>;
