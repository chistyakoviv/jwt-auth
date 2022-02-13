import {
    LocalStrategy,
    DEFAULTS,
    LocalStrategyOptions,
} from '../../src/strategies/local-strategy';
import {
    AuthMock,
    mockFetchUserOnce,
    mockReset,
    mockRequest,
    mockSetUser,
    mockCallOnError,
} from '../auth.mock';
import { defaultOptions } from '../../src/options';
import { Auth } from '../../src/auth';
import { Token } from '../../src/tokens/token';
import { RequestController } from '../../src/http/request-controller';

const mockSync = jest.fn();
const mockStatus = jest.fn();
const mockSet = jest.fn();
const mockTokenReset = jest.fn();

jest.mock('../../src/tokens/token', () => {
    return {
        Token: jest.fn().mockImplementation(() => {
            return {
                sync: mockSync,
                status: mockStatus,
                set: mockSet,
                reset: mockTokenReset,
            };
        }),
    };
});

const mockInitializeRequestInterceptor = jest.fn();
const mockControllerReset = jest.fn();

jest.mock('../../src/http/request-controller', () => {
    return {
        RequestController: jest.fn().mockImplementation(() => {
            return {
                initializeRequestInterceptor: mockInitializeRequestInterceptor,
                reset: mockControllerReset,
            };
        }),
    };
});

describe('Local strategy', () => {
    const VALID_TOKEN = 'valid_token';
    let auth: Auth;

    beforeEach(async () => {
        auth = new AuthMock(defaultOptions);
    });

    it('Constructs strategy', () => {
        const strategy = new LocalStrategy(auth, {} as LocalStrategyOptions);

        expect(Token).toHaveBeenCalledWith(strategy, auth.storage);
        expect(RequestController).toHaveBeenCalledWith(strategy);
    });

    it('Initializes strategy', async () => {
        const strategy = new LocalStrategy(auth, {} as LocalStrategyOptions);

        mockFetchUserOnce.mockResolvedValue({ status: 200 });

        const result = await strategy.init();

        expect(mockFetchUserOnce).toHaveBeenCalled();
        expect(mockInitializeRequestInterceptor).toHaveBeenCalled();
        expect(result).toStrictEqual({ status: 200 });
    });

    it('Checks valid token', () => {
        const strategy = new LocalStrategy(auth, {} as LocalStrategyOptions);

        mockSync.mockReturnValue(VALID_TOKEN);
        mockStatus.mockReturnValue({
            expired: jest.fn().mockReturnValue(false),
        });

        const result = strategy.check(true);

        expect(result).toStrictEqual({
            valid: true,
            tokenExpired: false,
        });
        expect(mockSync).toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalled();
    });

    it('Checks expired token', () => {
        const strategy = new LocalStrategy(auth, {} as LocalStrategyOptions);

        mockSync.mockReturnValue(VALID_TOKEN);
        mockStatus.mockReturnValue({
            expired: jest.fn().mockReturnValue(true),
        });

        const result = strategy.check(true);

        expect(result).toStrictEqual({
            valid: false,
            tokenExpired: true,
        });
        expect(mockSync).toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalled();
    });

    it('Checks expired token without checking status', () => {
        const strategy = new LocalStrategy(auth, {} as LocalStrategyOptions);

        mockSync.mockReturnValue(VALID_TOKEN);
        mockStatus.mockReturnValue({
            expired: jest.fn().mockReturnValue(true),
        });

        const result = strategy.check();

        expect(result).toStrictEqual({
            valid: true,
            tokenExpired: false,
        });
        expect(mockSync).toHaveBeenCalled();
        expect(mockStatus).not.toHaveBeenCalled();
    });

    it('Checks empty token', () => {
        const strategy = new LocalStrategy(auth, {} as LocalStrategyOptions);

        mockSync.mockReturnValue('');

        const result = strategy.check();

        expect(result).toStrictEqual({
            valid: false,
            tokenExpired: false,
        });
        expect(mockSync).toHaveBeenCalled();
        expect(mockStatus).not.toHaveBeenCalled();
    });

    it('Logins with turned off login endpoint', async () => {
        const strategy = new LocalStrategy(auth, {
            endpoints: { login: false, logout: false, user: false },
        } as unknown as LocalStrategyOptions);

        mockRequest.mockResolvedValue({ data: {} });

        const result = await strategy.login({ data: {} });

        expect(result).toBe(undefined);
    });

    it('Logins with reset', async () => {
        const strategy = new LocalStrategy(auth, {} as LocalStrategyOptions);

        mockRequest.mockResolvedValue({ data: { token: '' } });

        await strategy.login({ data: {} });

        expect(mockReset).toHaveBeenCalled();
    });

    it('Logins without reset', async () => {
        const strategy = new LocalStrategy(auth, {} as LocalStrategyOptions);

        mockRequest.mockResolvedValue({ data: { token: '' } });

        await strategy.login({ data: {} }, { reset: false });

        expect(mockReset).not.toHaveBeenCalled();
    });

    it('Logins with client_id, grant_type, scope', async () => {
        const strategy = new LocalStrategy(auth, {
            clientId: 'clientId',
            grantType: 'grantType',
            scope: 'scope',
        } as unknown as LocalStrategyOptions);

        mockRequest.mockResolvedValue({ data: { token: '' } });

        await strategy.login({ data: {} });

        expect(mockRequest).toHaveBeenCalledWith({
            url: '/api/auth/login',
            method: 'post',
            data: {
                client_id: 'clientId',
                grant_type: 'grantType',
                scope: 'scope',
            },
        });
    });

    it('Logins without client_id, grant_type, scope', async () => {
        const strategy = new LocalStrategy(auth, {} as LocalStrategyOptions);

        mockRequest.mockResolvedValue({ data: { token: '' } });

        await strategy.login({ data: {} });

        expect(mockRequest).toHaveBeenCalledWith({
            url: '/api/auth/login',
            method: 'post',
            data: {},
        });
    });

    it('Logins with custom url and method', async () => {
        const strategy = new LocalStrategy(auth, {
            endpoints: {
                login: { method: 'get', url: '/some/url' },
                logout: false,
                user: false,
            },
        } as LocalStrategyOptions);

        mockRequest.mockResolvedValue({ data: { token: '' } });

        await strategy.login({ data: {} });

        expect(mockRequest).toHaveBeenCalledWith({
            url: '/some/url',
            method: 'get',
            data: {},
        });
    });

    it('Logins with autofetching user', async () => {
        const strategy = new LocalStrategy(auth, {} as LocalStrategyOptions);

        mockRequest.mockResolvedValue({ data: { token: '' } });
        strategy.fetchUser = jest.fn();

        await strategy.login({ data: {} });

        expect(strategy.fetchUser).toHaveBeenCalled();
    });

    it('Logins without autofetching user', async () => {
        const strategy = new LocalStrategy(auth, {
            user: {
                property: 'user',
                autoFetch: false,
            },
        } as LocalStrategyOptions);

        mockRequest.mockResolvedValue({ data: { token: '' } });
        strategy.fetchUser = jest.fn();

        await strategy.login({ data: {} });

        expect(strategy.fetchUser).not.toHaveBeenCalled();
    });

    it('Logins and sets token', async () => {
        const strategy = new LocalStrategy(auth, {} as LocalStrategyOptions);

        mockRequest.mockResolvedValue({ data: { token: VALID_TOKEN } });

        await strategy.login({ data: {} });

        expect(mockSet).toHaveBeenCalledWith(VALID_TOKEN);
    });

    it('Sets new token', async () => {
        const strategy = new LocalStrategy(auth, {} as LocalStrategyOptions);

        strategy.fetchUser = jest.fn();

        await strategy.setUserToken(VALID_TOKEN);

        expect(mockSet).toHaveBeenCalledWith(VALID_TOKEN);
        expect(strategy.fetchUser).toHaveBeenCalled();
    });

    it('Fetches no user if token is invalid', async () => {
        const strategy = new LocalStrategy(auth, {} as LocalStrategyOptions);

        strategy.check = jest
            .fn()
            .mockReturnValue({ valid: false, tokenExpired: false });

        const result = await strategy.fetchUser();

        expect(result).toBe(undefined);
        expect(mockRequest).not.toHaveBeenCalled();
        expect(mockSetUser).not.toHaveBeenCalled();
        expect(strategy.check).toHaveBeenCalled();
    });

    it('Fetches no user if user endpoint is disabled', async () => {
        const strategy = new LocalStrategy(auth, {
            endpoints: {
                login: false,
                logout: false,
                user: false,
            },
        } as unknown as LocalStrategyOptions);

        strategy.check = jest
            .fn()
            .mockReturnValue({ valid: true, tokenExpired: false });

        const result = await strategy.fetchUser();

        expect(result).toBe(undefined);
        expect(mockRequest).not.toHaveBeenCalled();
        expect(mockSetUser).toHaveBeenCalledWith({});
        expect(strategy.check).toHaveBeenCalled();
    });

    it('Fetches valid user with default endpoint', async () => {
        const strategy = new LocalStrategy(auth, {} as LocalStrategyOptions);

        strategy.check = jest
            .fn()
            .mockReturnValue({ valid: true, tokenExpired: false });
        mockRequest.mockResolvedValue({ data: { user: 'test' } });

        const result = await strategy.fetchUser();

        expect(result).toStrictEqual({ data: { user: 'test' } });
        expect(mockRequest).toHaveBeenCalledWith({
            url: '/api/auth/user',
            method: 'get',
        });
    });

    it('Fetches valid user with passed endpoint', async () => {
        const strategy = new LocalStrategy(auth, {} as LocalStrategyOptions);

        strategy.check = jest
            .fn()
            .mockReturnValue({ valid: true, tokenExpired: false });
        mockRequest.mockResolvedValue({ data: { user: 'test' } });

        const result = await strategy.fetchUser({
            url: '/user',
            method: 'post',
        });

        expect(result).toStrictEqual({ data: { user: 'test' } });
        expect(mockRequest).toHaveBeenCalledWith({
            url: '/user',
            method: 'post',
        });
    });

    it('Fetches invalid user', async () => {
        const strategy = new LocalStrategy(auth, {} as LocalStrategyOptions);

        strategy.check = jest
            .fn()
            .mockReturnValue({ valid: true, tokenExpired: false });
        mockRequest.mockResolvedValue({ data: {} });

        try {
            await strategy.fetchUser();
        } catch (e: any) {
            expect(e.message).toEqual(
                `User Data response does not contain field ${DEFAULTS.user.property}`,
            );
        }
        expect(mockCallOnError).toHaveBeenCalled();
    });

    it('Throws error on fetching user when server responds with error', async () => {
        const strategy = new LocalStrategy(auth, {} as LocalStrategyOptions);

        strategy.check = jest
            .fn()
            .mockReturnValue({ valid: true, tokenExpired: false });
        mockRequest.mockRejectedValue({
            status: 500,
            message: 'Internal server error',
        });

        try {
            await strategy.fetchUser();
        } catch (e: any) {
            expect(e.message).toEqual('Internal server error');
        }
        expect(mockCallOnError).toHaveBeenCalled();
    });

    it('Logouts with default settings', async () => {
        const strategy = new LocalStrategy(auth, {} as LocalStrategyOptions);

        mockRequest.mockResolvedValue({ data: {} });

        await strategy.logout();

        expect(mockReset).toHaveBeenCalled();
        expect(mockRequest).toHaveBeenCalledWith({
            url: '/api/auth/logout',
            method: 'post',
        });
    });

    it('Logouts with custom settings', async () => {
        const strategy = new LocalStrategy(auth, {} as LocalStrategyOptions);

        mockRequest.mockResolvedValue({ data: {} });

        await strategy.logout({
            url: '/logout',
            method: 'get',
        });

        expect(mockReset).toHaveBeenCalled();
        expect(mockRequest).toHaveBeenCalledWith({
            url: '/logout',
            method: 'get',
        });
    });

    it('Does not logout when logout is disabled', async () => {
        const strategy = new LocalStrategy(auth, {
            endpoints: {
                login: false,
                logout: false,
                user: false,
            },
        } as unknown as LocalStrategyOptions);

        await strategy.logout();

        expect(mockReset).toHaveBeenCalled();
        expect(mockRequest).not.toHaveBeenCalled();
    });

    it('Resets with resetting interceptor', () => {
        const strategy = new LocalStrategy(auth, {} as LocalStrategyOptions);

        strategy.reset();

        expect(mockSetUser).toHaveBeenCalledWith(false);
        expect(mockTokenReset).toHaveBeenCalled();
        expect(mockControllerReset).toHaveBeenCalled();
    });

    it('Resets without resetting interceptor', () => {
        const strategy = new LocalStrategy(auth, {} as LocalStrategyOptions);

        strategy.reset({ resetInterceptor: false });

        expect(mockSetUser).toHaveBeenCalledWith(false);
        expect(mockTokenReset).toHaveBeenCalled();
        expect(mockControllerReset).not.toHaveBeenCalled();
    });
});
