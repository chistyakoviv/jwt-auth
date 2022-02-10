import {
    RefreshStrategy,
    DEFAULTS,
    RefreshStrategyOptions,
} from './refresh-strategy';
import { DEFAULTS as LOCAL_DEFAULTS } from './local-strategy';
import {
    AuthMock,
    mockFetchUserOnce,
    mockReset,
    mockRequest,
    mockSetUser,
    mockCallOnError,
} from '../auth.mock';
import { defaultOptions } from '../options';
import { Auth } from '../auth';
import { Token } from '../tokens/token';
import { RefreshToken } from '../tokens/refresh-token';
import { RequestController } from '../http/request-controller';
import { RefreshController } from '../http/refresh-controller';
import { ExpiredAuthSessionError } from '../errors/expired-auth-session-error';

const mockTokenSync = jest.fn();
const mockTokenStatus = jest.fn();
const mockTokenSet = jest.fn();
const mockTokenReset = jest.fn();
const mockTokenGet = jest.fn();

jest.mock('../tokens/token', () => {
    return {
        Token: jest.fn().mockImplementation(() => {
            return {
                sync: mockTokenSync,
                status: mockTokenStatus,
                set: mockTokenSet,
                reset: mockTokenReset,
                get: mockTokenGet,
            };
        }),
    };
});

const mockRefreshTokenSync = jest.fn();
const mockRefreshTokenStatus = jest.fn();
const mockRefreshTokenSet = jest.fn();
const mockRefreshTokenReset = jest.fn();
const mockRefreshTokenGet = jest.fn();

jest.mock('../tokens/refresh-token', () => {
    return {
        RefreshToken: jest.fn().mockImplementation(() => {
            return {
                sync: mockRefreshTokenSync,
                status: mockRefreshTokenStatus,
                set: mockRefreshTokenSet,
                reset: mockRefreshTokenReset,
                get: mockRefreshTokenGet,
            };
        }),
    };
});

const mockInitializeRequestInterceptor = jest.fn();
const mockControllerReset = jest.fn();
const mockControllerClearHeader = jest.fn();

jest.mock('../http/request-controller', () => {
    return {
        RequestController: jest.fn().mockImplementation(() => {
            return {
                initializeRequestInterceptor: mockInitializeRequestInterceptor,
                reset: mockControllerReset,
                clearHeader: mockControllerClearHeader,
            };
        }),
    };
});

jest.mock('../http/refresh-controller', () => {
    return {
        RefreshController: jest.fn().mockImplementation(() => {
            return {};
        }),
    };
});

describe('Refresh strategy', () => {
    const VALID_TOKEN = 'valid_token';
    let auth: Auth;

    beforeEach(async () => {
        auth = new AuthMock(defaultOptions);
    });

    it('Constructs strategy', () => {
        const strategy = new RefreshStrategy(
            auth,
            {} as RefreshStrategyOptions,
        );

        expect(Token).toHaveBeenCalledWith(strategy, auth.storage);
        expect(RefreshToken).toHaveBeenCalledWith(strategy, auth.storage);
        expect(RequestController).toHaveBeenCalledWith(strategy);
        expect(RefreshController).toHaveBeenCalledWith(strategy);
    });

    it('Initializes strategy', async () => {
        const strategy = new RefreshStrategy(
            auth,
            {} as RefreshStrategyOptions,
        );

        mockFetchUserOnce.mockResolvedValue({ status: 200 });

        const result = await strategy.init();

        expect(mockFetchUserOnce).toHaveBeenCalled();
        expect(mockInitializeRequestInterceptor).toHaveBeenCalled();
        expect(result).toStrictEqual({ status: 200 });
    });

    it('Checks valid token', () => {
        const strategy = new RefreshStrategy(
            auth,
            {} as RefreshStrategyOptions,
        );

        mockTokenSync.mockReturnValue(VALID_TOKEN);
        mockTokenStatus.mockReturnValue({
            expired: jest.fn().mockReturnValue(false),
        });

        mockRefreshTokenSync.mockReturnValue(VALID_TOKEN);
        mockRefreshTokenStatus.mockReturnValue({
            expired: jest.fn().mockReturnValue(false),
        });

        const result = strategy.check(true);

        expect(result).toStrictEqual({
            valid: true,
            tokenExpired: false,
            refreshTokenExpired: false,
            isRefreshable: true,
        });
        expect(mockTokenSync).toHaveBeenCalled();
        expect(mockTokenSync).toHaveBeenCalled();
        expect(mockRefreshTokenSync).toHaveBeenCalled();
        expect(mockRefreshTokenStatus).toHaveBeenCalled();
    });

    it('Checks expired token', () => {
        const strategy = new RefreshStrategy(
            auth,
            {} as RefreshStrategyOptions,
        );

        mockTokenSync.mockReturnValue(VALID_TOKEN);
        mockTokenStatus.mockReturnValue({
            expired: jest.fn().mockReturnValue(true),
        });

        mockRefreshTokenSync.mockReturnValue(VALID_TOKEN);
        mockRefreshTokenStatus.mockReturnValue({
            expired: jest.fn().mockReturnValue(false),
        });

        const result = strategy.check(true);

        expect(result).toStrictEqual({
            valid: false,
            tokenExpired: true,
            refreshTokenExpired: false,
            isRefreshable: true,
        });
        expect(mockTokenSync).toHaveBeenCalled();
        expect(mockTokenSync).toHaveBeenCalled();
        expect(mockRefreshTokenSync).toHaveBeenCalled();
        expect(mockRefreshTokenStatus).toHaveBeenCalled();
    });

    it('Checks expired refresh token', () => {
        const strategy = new RefreshStrategy(
            auth,
            {} as RefreshStrategyOptions,
        );

        mockTokenSync.mockReturnValue(VALID_TOKEN);
        mockTokenStatus.mockReturnValue({
            expired: jest.fn().mockReturnValue(false),
        });

        mockRefreshTokenSync.mockReturnValue(VALID_TOKEN);
        mockRefreshTokenStatus.mockReturnValue({
            expired: jest.fn().mockReturnValue(true),
        });

        const result = strategy.check(true);

        expect(result).toStrictEqual({
            valid: false,
            tokenExpired: false,
            refreshTokenExpired: true,
            isRefreshable: true,
        });
        expect(mockTokenSync).toHaveBeenCalled();
        expect(mockTokenSync).toHaveBeenCalled();
        expect(mockRefreshTokenSync).toHaveBeenCalled();
        expect(mockRefreshTokenStatus).toHaveBeenCalled();
    });

    it('Checks expired tokens without checking status', () => {
        const strategy = new RefreshStrategy(
            auth,
            {} as RefreshStrategyOptions,
        );

        mockTokenSync.mockReturnValue(VALID_TOKEN);
        mockTokenStatus.mockReturnValue({
            expired: jest.fn().mockReturnValue(true),
        });

        mockRefreshTokenSync.mockReturnValue(VALID_TOKEN);
        mockRefreshTokenStatus.mockReturnValue({
            expired: jest.fn().mockReturnValue(true),
        });

        const result = strategy.check();

        expect(result).toStrictEqual({
            valid: true,
            tokenExpired: false,
            refreshTokenExpired: false,
            isRefreshable: true,
        });
        expect(mockTokenSync).toHaveBeenCalled();
        expect(mockTokenStatus).not.toHaveBeenCalled();
        expect(mockRefreshTokenSync).toHaveBeenCalled();
        expect(mockRefreshTokenStatus).not.toHaveBeenCalled();
    });

    it('Checks empty token', () => {
        const strategy = new RefreshStrategy(
            auth,
            {} as RefreshStrategyOptions,
        );

        mockTokenSync.mockReturnValue('');
        mockRefreshTokenSync.mockReturnValue(VALID_TOKEN);

        const result = strategy.check();

        expect(result).toStrictEqual({
            valid: false,
            tokenExpired: false,
            refreshTokenExpired: false,
            isRefreshable: true,
        });
        expect(mockTokenSync).toHaveBeenCalled();
        expect(mockTokenStatus).not.toHaveBeenCalled();
        expect(mockRefreshTokenSync).toHaveBeenCalled();
        expect(mockRefreshTokenStatus).not.toHaveBeenCalled();
    });

    it('Checks empty refresh token', () => {
        const strategy = new RefreshStrategy(
            auth,
            {} as RefreshStrategyOptions,
        );

        mockTokenSync.mockReturnValue(VALID_TOKEN);
        mockRefreshTokenSync.mockReturnValue('');

        const result = strategy.check();

        expect(result).toStrictEqual({
            valid: false,
            tokenExpired: false,
            refreshTokenExpired: false,
            isRefreshable: true,
        });
        expect(mockTokenSync).toHaveBeenCalled();
        expect(mockTokenStatus).not.toHaveBeenCalled();
        expect(mockRefreshTokenSync).toHaveBeenCalled();
        expect(mockRefreshTokenStatus).not.toHaveBeenCalled();
    });

    it('Refreshes strategy tokens when refresh endpoint is disabled', async () => {
        const strategy = new RefreshStrategy(auth, {
            endpoints: {
                refresh: false,
            },
        } as unknown as RefreshStrategyOptions);

        const result = await strategy.refreshTokens();

        expect(result).toBe(undefined);
    });

    it('Refreshes strategy tokens when status is invalid', async () => {
        const strategy = new RefreshStrategy(
            auth,
            {} as RefreshStrategyOptions,
        );

        strategy.check = jest.fn().mockReturnValue({
            valid: false,
            tokenExpired: false,
            refreshTokenExpired: false,
            isRefreshable: true,
        });

        const result = await strategy.refreshTokens();

        expect(result).toBe(undefined);
    });

    it('Throws error if refresh token is expired', async () => {
        const strategy = new RefreshStrategy(
            auth,
            {} as RefreshStrategyOptions,
        );

        strategy.check = jest.fn().mockReturnValue({
            valid: true,
            tokenExpired: false,
            refreshTokenExpired: false,
            isRefreshable: true,
        });

        strategy.refreshToken.status = jest.fn().mockReturnValue({
            expired: jest.fn().mockReturnValue(true),
        });

        try {
            await strategy.refreshTokens();
        } catch (e) {
            expect(e).toBeInstanceOf(ExpiredAuthSessionError);
        }
        expect(mockReset).toHaveBeenCalled();
    });

    it('Clears header if refresh token is not required', async () => {
        const strategy = new RefreshStrategy(
            auth,
            {} as RefreshStrategyOptions,
        );

        strategy.check = jest.fn().mockReturnValue({
            valid: true,
            tokenExpired: false,
            refreshTokenExpired: false,
            isRefreshable: true,
        });

        strategy.refreshToken.status = jest.fn().mockReturnValue({
            expired: jest.fn().mockReturnValue(false),
        });
        mockRequest.mockResolvedValue({ data: {} });

        await strategy.refreshTokens();

        expect(mockControllerClearHeader).toHaveBeenCalled();
    });

    it('Adds refresh token to request when required', async () => {
        const strategy = new RefreshStrategy(
            auth,
            {} as RefreshStrategyOptions,
        );

        strategy.check = jest.fn().mockReturnValue({
            valid: true,
            tokenExpired: false,
            refreshTokenExpired: false,
            isRefreshable: true,
        });

        strategy.refreshToken.status = jest.fn().mockReturnValue({
            expired: jest.fn().mockReturnValue(false),
        });
        mockRequest.mockResolvedValue({ data: {} });
        mockRefreshTokenGet.mockReturnValue(VALID_TOKEN);

        await strategy.refreshTokens();

        expect(mockRequest).toHaveBeenCalledWith({
            url: '/api/auth/refresh',
            method: 'post',
            data: {
                refresh_token: VALID_TOKEN,
            },
        });
    });

    it('Refreshes tokens with grant type and client id', async () => {
        const strategy = new RefreshStrategy(auth, {
            refreshToken: {
                required: false,
            },
            clientId: 1,
            grantType: true,
        } as unknown as RefreshStrategyOptions);

        strategy.check = jest.fn().mockReturnValue({
            valid: true,
            tokenExpired: false,
            refreshTokenExpired: false,
            isRefreshable: true,
        });

        strategy.refreshToken.status = jest.fn().mockReturnValue({
            expired: jest.fn().mockReturnValue(false),
        });
        mockRequest.mockResolvedValue({ data: {} });

        await strategy.refreshTokens();

        expect(mockRequest).toHaveBeenCalledWith({
            url: '/api/auth/refresh',
            method: 'post',
            data: {
                client_id: 1,
                grant_type: 'refresh_token',
            },
        });
    });

    it('Calls error handlers when server responds with error', async () => {
        const strategy = new RefreshStrategy(auth, {
            refreshToken: {
                required: false,
            },
        } as unknown as RefreshStrategyOptions);

        strategy.check = jest.fn().mockReturnValue({
            valid: true,
            tokenExpired: false,
            refreshTokenExpired: false,
            isRefreshable: true,
        });

        strategy.refreshToken.status = jest.fn().mockReturnValue({
            expired: jest.fn().mockReturnValue(false),
        });
        mockRequest.mockRejectedValue({
            status: 500,
            message: 'Internal server error',
        });

        try {
            await strategy.refreshTokens();
        } catch (e) {}

        expect(mockCallOnError).toHaveBeenCalledWith(
            { status: 500, message: 'Internal server error' },
            { method: 'refreshToken' },
        );
    });

    it('Logins when login endpoint is disabled', async () => {
        const strategy = new RefreshStrategy(auth, {
            endpoints: { login: false, logout: false, user: false },
        } as unknown as RefreshStrategyOptions);

        const result = await strategy.login({ data: {} });

        expect(result).toBe(undefined);
    });

    it('Logins with reset', async () => {
        const strategy = new RefreshStrategy(
            auth,
            {} as RefreshStrategyOptions,
        );
        mockRequest.mockResolvedValue({ data: { token: '' } });

        await strategy.login({ data: {} });

        expect(mockReset).toHaveBeenCalled();
    });

    it('Logins without reset', async () => {
        const strategy = new RefreshStrategy(
            auth,
            {} as RefreshStrategyOptions,
        );

        mockRequest.mockResolvedValue({ data: { token: '' } });

        await strategy.login({ data: {} }, { reset: false });

        expect(mockReset).not.toHaveBeenCalled();
    });

    it('Logins with client_id, grant_type, scope', async () => {
        const strategy = new RefreshStrategy(auth, {
            ...DEFAULTS,
            clientId: 'clientId',
            grantType: 'grantType',
            scope: 'scope',
        } as unknown as RefreshStrategyOptions);

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
        const strategy = new RefreshStrategy(
            auth,
            {} as RefreshStrategyOptions,
        );

        mockRequest.mockResolvedValue({ data: { token: '' } });

        await strategy.login({ data: {} });

        expect(mockRequest).toHaveBeenCalledWith({
            url: '/api/auth/login',
            method: 'post',
            data: {},
        });
    });

    it('Logins with custom url and method', async () => {
        const strategy = new RefreshStrategy(auth, {
            ...DEFAULTS,
            endpoints: {
                login: { method: 'get', url: '/some/url' },
                logout: false,
                user: false,
            },
        } as RefreshStrategyOptions);

        mockRequest.mockResolvedValue({ data: { token: '' } });

        await strategy.login({ data: {} });

        expect(mockRequest).toHaveBeenCalledWith({
            url: '/some/url',
            method: 'get',
            data: {},
        });
    });

    it('Logins with autofetching user', async () => {
        const strategy = new RefreshStrategy(
            auth,
            {} as RefreshStrategyOptions,
        );

        mockRequest.mockResolvedValue({ data: { token: '' } });
        strategy.fetchUser = jest.fn();

        await strategy.login({ data: {} });

        expect(strategy.fetchUser).toHaveBeenCalled();
    });

    it('Logins without autofetching user', async () => {
        const strategy = new RefreshStrategy(auth, {
            ...DEFAULTS,
            user: {
                property: 'user',
                autoFetch: false,
            },
        } as RefreshStrategyOptions);

        mockRequest.mockResolvedValue({ data: { token: '' } });
        strategy.fetchUser = jest.fn();

        await strategy.login({ data: {} });

        expect(strategy.fetchUser).not.toHaveBeenCalled();
    });

    it('Logins and sets token', async () => {
        const strategy = new RefreshStrategy(
            auth,
            {} as RefreshStrategyOptions,
        );

        mockRequest.mockResolvedValue({ data: { token: VALID_TOKEN } });

        await strategy.login({ data: {} });

        expect(mockTokenSet).toHaveBeenCalledWith(VALID_TOKEN);
    });

    it('Sets new token', async () => {
        const strategy = new RefreshStrategy(
            auth,
            {} as RefreshStrategyOptions,
        );

        strategy.fetchUser = jest.fn();

        await strategy.setUserToken(VALID_TOKEN);

        expect(mockTokenSet).toHaveBeenCalledWith(VALID_TOKEN);
        expect(strategy.fetchUser).toHaveBeenCalled();
    });

    it('Fetches no user if token is invalid', async () => {
        const strategy = new RefreshStrategy(
            auth,
            {} as RefreshStrategyOptions,
        );

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
        const strategy = new RefreshStrategy(auth, {
            ...DEFAULTS,
            endpoints: {
                login: false,
                logout: false,
                user: false,
            },
        } as unknown as RefreshStrategyOptions);

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
        const strategy = new RefreshStrategy(
            auth,
            {} as RefreshStrategyOptions,
        );

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
        const strategy = new RefreshStrategy(
            auth,
            {} as RefreshStrategyOptions,
        );

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
        const strategy = new RefreshStrategy(
            auth,
            {} as RefreshStrategyOptions,
        );

        strategy.check = jest
            .fn()
            .mockReturnValue({ valid: true, tokenExpired: false });
        mockRequest.mockResolvedValue({ data: {} });

        try {
            await strategy.fetchUser();
        } catch (e: any) {
            expect(e.message).toEqual(
                `User Data response does not contain field ${LOCAL_DEFAULTS.user.property}`,
            );
        }
        expect(mockCallOnError).toHaveBeenCalled();
    });

    it('Throws error on fetching user when server responds with error', async () => {
        const strategy = new RefreshStrategy(
            auth,
            {} as RefreshStrategyOptions,
        );

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
        const strategy = new RefreshStrategy(
            auth,
            {} as RefreshStrategyOptions,
        );

        mockRequest.mockResolvedValue({ data: {} });

        await strategy.logout();

        expect(mockReset).toHaveBeenCalled();
        expect(mockRequest).toHaveBeenCalledWith({
            url: '/api/auth/logout',
            method: 'post',
        });
    });

    it('Logouts with custom settings', async () => {
        const strategy = new RefreshStrategy(
            auth,
            {} as RefreshStrategyOptions,
        );

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
        const strategy = new RefreshStrategy(auth, {
            ...DEFAULTS,
            endpoints: {
                login: false,
                logout: false,
                user: false,
            },
        } as unknown as RefreshStrategyOptions);

        await strategy.logout();

        expect(mockReset).toHaveBeenCalled();
        expect(mockRequest).not.toHaveBeenCalled();
    });

    it('Resets with resetting interceptor', () => {
        const strategy = new RefreshStrategy(
            auth,
            {} as RefreshStrategyOptions,
        );

        strategy.reset();

        expect(mockSetUser).toHaveBeenCalledWith(false);
        expect(mockTokenReset).toHaveBeenCalled();
        expect(mockControllerReset).toHaveBeenCalled();
    });

    it('Resets without resetting interceptor', () => {
        const strategy = new RefreshStrategy(
            auth,
            {} as RefreshStrategyOptions,
        );

        strategy.reset({ resetInterceptor: false });

        expect(mockSetUser).toHaveBeenCalledWith(false);
        expect(mockTokenReset).toHaveBeenCalled();
        expect(mockControllerReset).not.toHaveBeenCalled();
    });
});
