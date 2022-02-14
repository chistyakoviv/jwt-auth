import { Auth } from '../src/auth';
import { AuthOptions } from '../src/options';
import { CookieStorageMock } from './storages/cookie-storage.mock';
import {
    LocalStrategyMock,
    mockInit,
    mockLogin,
    mockFetchUser,
    mockLogout,
    mockReset,
    mockCheck,
} from './strategies/local-strategy.mock';
import { AggregatorStorage } from '../src/storages/aggregator-storage';
import { LocalStrategyOptions } from '../src/strategies/local-strategy';

const mockStorageSync = jest.fn();
const mockStorageSet = jest.fn();
const mockStorageGet = jest.fn();
const mockStorageRemove = jest.fn();

jest.mock('../src/storages/aggregator-storage', () => {
    return {
        AggregatorStorage: jest.fn().mockImplementation(() => {
            return {
                sync: mockStorageSync,
                set: mockStorageSet,
                get: mockStorageGet,
                remove: mockStorageRemove,
            };
        }),
    };
});

describe('Auth', () => {
    const optionsWithDefaultStrategy = {
        strategies: [
            {
                strategy: LocalStrategyMock,
                strategyOptions: {
                    name: 'local',
                },
            },
        ],
    } as unknown as AuthOptions;

    it('Instantiates Auth', () => {
        new Auth({
            storages: [
                {
                    storage: CookieStorageMock,
                },
            ],
            strategies: [
                {
                    strategy: LocalStrategyMock,
                    strategyOptions: {
                        name: 'local',
                    },
                },
            ],
        } as unknown as AuthOptions);

        expect(AggregatorStorage).toHaveBeenCalled();
        expect(CookieStorageMock).toHaveBeenCalled();
        expect(LocalStrategyMock).toHaveBeenCalled();
    });

    it('Inits Auth with current strategy', async () => {
        const auth = new Auth(optionsWithDefaultStrategy);

        auth.getStrategy = jest.fn().mockImplementation(
            () =>
                new LocalStrategyMock(auth, {
                    name: 'local',
                } as LocalStrategyOptions),
        );

        await auth.init();

        expect(mockStorageSync).toHaveBeenCalled();
        expect(mockStorageSet).not.toHaveBeenCalled();
        expect(mockInit).toHaveBeenCalled();
    });

    it('Returns nothing when receiving strategy is failed', async () => {
        const auth = new Auth(optionsWithDefaultStrategy);

        auth.getStrategy = jest.fn().mockImplementation(() => {
            return false;
        });

        const result = await auth.init();

        expect(mockStorageSync).toHaveBeenCalled();
        expect(mockStorageSet).toHaveBeenCalled();
        expect(mockInit).not.toHaveBeenCalled();
        expect(result).toBe(undefined);
    });

    it('Inits Auth with default strategy', async () => {
        const auth = new Auth(optionsWithDefaultStrategy);

        let mockCalls = 0;

        auth.getStrategy = jest.fn().mockImplementation(() => {
            mockCalls++;
            if (mockCalls === 1) return false;
            return new LocalStrategyMock(auth, {
                name: 'local',
            } as LocalStrategyOptions);
        });

        await auth.init();

        expect(mockStorageSync).toHaveBeenCalled();
        expect(mockStorageSet).toHaveBeenCalled();
        expect(mockInit).toHaveBeenCalled();
    });

    it('Gets strategy from storage', async () => {
        const auth = new Auth(optionsWithDefaultStrategy);

        mockStorageGet.mockReturnValue('local');

        const result = await auth.getStrategy();

        expect(mockStorageGet).toHaveBeenCalled();
        expect(result).toBeInstanceOf(LocalStrategyMock);
    });

    it('Throws exception on getting strategy when strategy is not set', async () => {
        const auth = new Auth(optionsWithDefaultStrategy);

        mockStorageGet.mockReturnValue('');

        try {
            await auth.getStrategy();
        } catch (e: any) {
            expect(e.message).toBe('No strategy is set!');
        }

        expect(mockStorageGet).toHaveBeenCalled();
    });

    it('Throws exception on getting strategy when strategy is not supported', async () => {
        const auth = new Auth(optionsWithDefaultStrategy);

        mockStorageGet.mockReturnValue('test');

        try {
            await auth.getStrategy();
        } catch (e: any) {
            expect(e.message).toBe('Strategy not supported: test');
        }

        expect(mockStorageGet).toHaveBeenCalled();
    });

    it('Does not throw exception on getting strategy when strategy is not set', async () => {
        const auth = new Auth(optionsWithDefaultStrategy);

        mockStorageGet.mockReturnValue('');

        const result = await auth.getStrategy(false);

        expect(mockStorageGet).toHaveBeenCalled();
        expect(result).toBe(undefined);
    });

    it('Does not set new strategy on setting strategy if it is equal to the current one', () => {
        const auth = new Auth(optionsWithDefaultStrategy);

        auth.reset = jest.fn();
        mockStorageGet.mockReturnValue('local');

        auth.setStrategy('local');

        expect(auth.reset).not.toHaveBeenCalled();
        expect(mockStorageSet).not.toHaveBeenCalled();
        expect(mockStorageGet).toHaveBeenCalledWith('strategy');
    });

    it('Throws error on setting strategy when strategy is not defined', () => {
        const auth = new Auth(optionsWithDefaultStrategy);

        auth.reset = jest.fn();

        try {
            auth.setStrategy('test');
        } catch (e: any) {
            expect(e.message).toBe('Strategy test is not defined!');
        }

        expect(auth.reset).not.toHaveBeenCalled();
        expect(mockStorageSet).not.toHaveBeenCalled();
        expect(mockStorageGet).toHaveBeenCalledWith('strategy');
    });

    it('Sets new strategy', () => {
        const auth = new Auth(optionsWithDefaultStrategy);

        auth.reset = jest.fn();
        mockStorageGet.mockReturnValue('refresh');

        auth.setStrategy('local');

        expect(auth.reset).toHaveBeenCalled();
        expect(mockStorageSet).toHaveBeenCalledWith('strategy', 'local');
        expect(mockStorageGet).toHaveBeenCalledWith('strategy');
    });

    it('Logins with strategy name', async () => {
        const auth = new Auth(optionsWithDefaultStrategy);

        auth.setStrategy = jest.fn();
        auth.login = jest.fn();

        await auth.loginWith('local', { url: '/login' });

        expect(auth.setStrategy).toHaveBeenCalledWith('local');
        expect(auth.login).toHaveBeenCalledWith({ url: '/login' });
    });

    it('Logins', async () => {
        const auth = new Auth(optionsWithDefaultStrategy);

        auth.getStrategy = jest.fn().mockImplementation(
            () =>
                new LocalStrategyMock(auth, {
                    name: 'local',
                } as LocalStrategyOptions),
        );
        mockLogin.mockResolvedValue({ status: 200 });

        const result = await auth.login({ url: '/login' });

        expect(result).toStrictEqual({ status: 200 });
        expect(mockLogin).toHaveBeenCalledWith({ url: '/login' });
    });

    it('Throws error on login when server responds with error', async () => {
        const auth = new Auth(optionsWithDefaultStrategy);

        auth.getStrategy = jest.fn().mockImplementation(
            () =>
                new LocalStrategyMock(auth, {
                    name: 'local',
                } as LocalStrategyOptions),
        );
        auth.callOnError = jest.fn();
        mockLogin.mockRejectedValue({
            status: 500,
            message: 'Internal server error',
        });

        try {
            await auth.login({ url: '/login' });
        } catch (e: any) {
            expect(e).toStrictEqual({
                status: 500,
                message: 'Internal server error',
            });
        }

        expect(auth.callOnError).toHaveBeenCalledWith(
            { status: 500, message: 'Internal server error' },
            { method: 'login' },
        );
        expect(mockLogin).toHaveBeenCalledWith({ url: '/login' });
    });

    it('Fetches user', async () => {
        const auth = new Auth(optionsWithDefaultStrategy);

        auth.getStrategy = jest.fn().mockImplementation(
            () =>
                new LocalStrategyMock(auth, {
                    name: 'local',
                } as LocalStrategyOptions),
        );
        mockFetchUser.mockResolvedValue({ status: 200 });

        const result = await auth.fetchUser({ url: '/user' });

        expect(result).toStrictEqual({ status: 200 });
        expect(mockFetchUser).toHaveBeenCalledWith({ url: '/user' });
    });

    it('Throws error on fetching user when server responds with error', async () => {
        const auth = new Auth(optionsWithDefaultStrategy);

        auth.getStrategy = jest.fn().mockImplementation(
            () =>
                new LocalStrategyMock(auth, {
                    name: 'local',
                } as LocalStrategyOptions),
        );
        auth.callOnError = jest.fn();
        mockFetchUser.mockRejectedValue({
            status: 500,
            message: 'Internal server error',
        });

        try {
            await auth.fetchUser({ url: '/login' });
        } catch (e: any) {
            expect(e).toStrictEqual({
                status: 500,
                message: 'Internal server error',
            });
        }

        expect(auth.callOnError).toHaveBeenCalledWith(
            { status: 500, message: 'Internal server error' },
            { method: 'fetchUser' },
        );
        expect(mockFetchUser).toHaveBeenCalledWith({ url: '/login' });
    });

    it('Logouts', async () => {
        const auth = new Auth(optionsWithDefaultStrategy);

        auth.reset = jest.fn();
        auth.getStrategy = jest.fn().mockImplementation(
            () =>
                new LocalStrategyMock(auth, {
                    name: 'local',
                } as LocalStrategyOptions),
        );
        mockLogout.mockResolvedValue({ status: 200 });

        const result = await auth.logout({ url: '/logout' });

        expect(result).toStrictEqual({ status: 200 });
        expect(mockLogout).toHaveBeenCalledWith({ url: '/logout' });
        expect(auth.reset).not.toHaveBeenCalled();
    });

    it('Throws error on fetching user when server responds with error', async () => {
        const auth = new Auth(optionsWithDefaultStrategy);

        auth.reset = jest.fn();
        auth.getStrategy = jest.fn().mockImplementation(
            () =>
                new LocalStrategyMock(auth, {
                    name: 'local',
                } as LocalStrategyOptions),
        );
        auth.callOnError = jest.fn();
        mockLogout.mockRejectedValue({
            status: 500,
            message: 'Internal server error',
        });

        try {
            await auth.logout({ url: '/logout' });
        } catch (e: any) {
            expect(e).toStrictEqual({
                status: 500,
                message: 'Internal server error',
            });
        }

        expect(auth.callOnError).toHaveBeenCalledWith(
            { status: 500, message: 'Internal server error' },
            { method: 'logout' },
        );
        expect(mockLogout).toHaveBeenCalledWith({ url: '/logout' });
        expect(auth.reset).not.toHaveBeenCalled();
    });

    it('Resets current strategy', () => {
        const auth = new Auth(optionsWithDefaultStrategy);

        auth.getStrategy = jest.fn().mockImplementation(
            () =>
                new LocalStrategyMock(auth, {
                    name: 'local',
                } as LocalStrategyOptions),
        );

        auth.reset({ resetInterceptor: true });

        expect(mockReset).toHaveBeenCalledWith({ resetInterceptor: true });
    });

    it('Checks current strategy', () => {
        const auth = new Auth(optionsWithDefaultStrategy);

        auth.getStrategy = jest.fn().mockImplementation(
            () =>
                new LocalStrategyMock(auth, {
                    name: 'local',
                } as LocalStrategyOptions),
        );

        auth.check(true);

        expect(mockCheck).toHaveBeenCalledWith(true);
    });

    it('Fetches user if it is not already defined', async () => {
        const auth = new Auth(optionsWithDefaultStrategy);

        auth.fetchUser = jest.fn().mockResolvedValue({ status: 200 });

        const result = await auth.fetchUserOnce({ url: '/user' });

        expect(result).toStrictEqual({ status: 200 });
        expect(auth.fetchUser).toHaveBeenCalledWith({ url: '/user' });
    });

    it('Does not fetches user if it is already defined', async () => {
        const auth = new Auth(optionsWithDefaultStrategy);

        auth.fetchUser = jest.fn();
        auth.check = jest.fn().mockReturnValue({ valid: true });
        auth.setUser('user name');

        const result = await auth.fetchUserOnce();

        expect(result).toStrictEqual(undefined);
        expect(auth.fetchUser).not.toHaveBeenCalled();
    });

    it('Sets valid user', () => {
        const auth = new Auth(optionsWithDefaultStrategy);

        auth.check = jest.fn().mockReturnValue({ valid: true });

        auth.setUser({ name: 'test' });

        expect(auth.check).toHaveBeenCalled();
    });

    it('Sets invalid user', () => {
        const auth = new Auth(optionsWithDefaultStrategy);

        auth.check = jest.fn().mockReturnValue({ valid: true });

        auth.setUser('');

        expect(auth.check).not.toHaveBeenCalled();
    });

    it('Calls listeners on error', () => {
        const auth = new Auth(optionsWithDefaultStrategy);

        const errorCallback = jest.fn();
        const error = new Error('some error');

        auth.onError(errorCallback);

        auth.callOnError(error, { method: 'test' });

        expect(errorCallback).toHaveBeenCalledWith(error, { method: 'test' });
    });
});
