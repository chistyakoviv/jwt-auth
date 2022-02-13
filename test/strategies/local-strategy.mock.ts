import { LocalStrategy, DEFAULTS } from '../../src/strategies/local-strategy';
import { RequestControllerMock } from '../http/request-controller.mock';
import { Auth } from '../../src/auth';

export * from '../http/request-controller.mock';
export {
    DEFAULTS,
    LocalStrategyOptions,
} from '../../src/strategies/local-strategy';
export const mockInit = jest.fn();
export const mockLogin = jest.fn();
export const mockFetchUser = jest.fn();
export const mockReset = jest.fn();
export const mockCheck = jest.fn();
export const mockLogout = jest.fn();
export const mockAuth = jest.fn();

export const LocalStrategyMock = jest
    .fn()
    .mockImplementation((auth: Auth, options) => {
        const strategy = Object.create(LocalStrategyMock.prototype);
        const methods = {
            auth,
            options: { ...DEFAULTS, ...options },

            init: mockInit,
            login: mockLogin,
            fetchUser: mockFetchUser,
            reset: mockReset,
            check: mockCheck,
            logout: mockLogout,
        };
        strategy.requestController = new RequestControllerMock(strategy);

        return Object.assign(strategy, methods);
    }) as jest.MockedClass<typeof LocalStrategy>;
