import {
    LocalStrategy,
    DEFAULTS,
    LocalStrategyOptions,
} from './local-strategy';
import {
    AuthMock,
    mockFetchUserOnce,
    mockReset,
    mockRequest,
} from '../auth.mock';
import { defaultOptions } from '../options';
import { Auth } from '../auth';
import { Token } from '../tokens/token';
import { RequestController } from '../http/request-controller';

const mockSync = jest.fn();
const mockStatus = jest.fn();
const mockSet = jest.fn();

jest.mock('../tokens/token', () => {
    return {
        Token: jest.fn().mockImplementation(() => {
            return {
                sync: mockSync,
                status: mockStatus,
                set: mockSet,
            };
        }),
    };
});

const mockInitializeRequestInterceptor = jest.fn();

jest.mock('../http/request-controller', () => {
    return {
        RequestController: jest.fn().mockImplementation(() => {
            return {
                initializeRequestInterceptor: mockInitializeRequestInterceptor,
            };
        }),
    };
});

describe('Local strategy', () => {
    const VALID_TOKEN = 'valid_token';
    let auth: Auth;

    beforeEach(async () => {
        auth = new AuthMock(defaultOptions);
        AuthMock.mockClear();
        (Token as jest.Mock).mockClear();
        (RequestController as jest.Mock).mockClear();
        mockFetchUserOnce.mockClear();
        mockInitializeRequestInterceptor.mockClear();
        mockSync.mockClear();
        mockStatus.mockClear();
        mockReset.mockClear();
        mockRequest.mockClear();
    });

    it('Constructs strategy', () => {
        const strategy = new LocalStrategy(auth, {
            ...DEFAULTS,
        } as LocalStrategyOptions);

        expect(Token).toHaveBeenCalledWith(strategy, auth.storage);
        expect(RequestController).toHaveBeenCalledWith(strategy);
    });

    it('Initializes strategy', async () => {
        const strategy = new LocalStrategy(auth, {
            ...DEFAULTS,
        } as LocalStrategyOptions);

        mockFetchUserOnce.mockResolvedValue({ status: 200 });

        const result = await strategy.init();

        expect(mockFetchUserOnce).toHaveBeenCalled();
        expect(mockInitializeRequestInterceptor).toHaveBeenCalled();
        expect(result).toStrictEqual({ status: 200 });
    });

    it('Checks valid token', () => {
        const strategy = new LocalStrategy(auth, {
            ...DEFAULTS,
        } as LocalStrategyOptions);

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
        const strategy = new LocalStrategy(auth, {
            ...DEFAULTS,
        } as LocalStrategyOptions);

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
        const strategy = new LocalStrategy(auth, {
            ...DEFAULTS,
        } as LocalStrategyOptions);

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
        const strategy = new LocalStrategy(auth, {
            ...DEFAULTS,
        } as LocalStrategyOptions);

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
            ...DEFAULTS,
            endpoints: { login: false, logout: false, user: false },
        } as LocalStrategyOptions);

        const result = await strategy.login({ data: {} });

        expect(result).toBe(undefined);
    });

    it('Logins with reset', async () => {
        const strategy = new LocalStrategy(auth, {
            ...DEFAULTS,
        } as LocalStrategyOptions);

        mockRequest.mockResolvedValue({ data: { token: '' } });

        await strategy.login({ data: {} });

        expect(mockReset).toHaveBeenCalled();
    });

    it('Logins without reset', async () => {
        const strategy = new LocalStrategy(auth, {
            ...DEFAULTS,
        } as LocalStrategyOptions);

        mockRequest.mockResolvedValue({ data: { token: '' } });

        await strategy.login({ data: {} }, { reset: false });

        expect(mockReset).not.toHaveBeenCalled();
    });

    it('Logins with client_id, grant_type, scope', async () => {
        const strategy = new LocalStrategy(auth, {
            ...DEFAULTS,
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
        const strategy = new LocalStrategy(auth, {
            ...DEFAULTS,
        } as LocalStrategyOptions);

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
            ...DEFAULTS,
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
        const strategy = new LocalStrategy(auth, {
            ...DEFAULTS,
        } as LocalStrategyOptions);

        mockRequest.mockResolvedValue({ data: { token: '' } });
        strategy.fetchUser = jest.fn();

        await strategy.login({ data: {} });

        expect(strategy.fetchUser).toHaveBeenCalled();
    });

    it('Logins without autofetching user', async () => {
        const strategy = new LocalStrategy(auth, {
            ...DEFAULTS,
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
        const strategy = new LocalStrategy(auth, {
            ...DEFAULTS,
        } as LocalStrategyOptions);

        mockRequest.mockResolvedValue({ data: { token: VALID_TOKEN } });

        await strategy.login({ data: {} });

        expect(mockSet).toHaveBeenCalledWith(VALID_TOKEN);
    });
});
