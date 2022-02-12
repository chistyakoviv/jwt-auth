import { Auth } from './auth';
import { AuthOptions } from './options';
import { CookieStorageMock } from './storages/cookie-storage.mock';
import { LocalStrategyMock, mockInit } from './strategies/local-strategy.mock';
import { AggregatorStorage } from './storages/aggregator-storage';
import { LocalStrategyOptions } from './strategies/local-strategy';

const mockStorageSync = jest.fn();
const mockStorageSet = jest.fn();
const mockStorageGet = jest.fn();
const mockStorageRemove = jest.fn();

jest.mock('./storages/aggregator-storage', () => {
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
    it('Instantiates Auth', () => {
        const auth = new Auth({
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
        const auth = new Auth({
            strategies: [
                {
                    strategy: LocalStrategyMock,
                    strategyOptions: {
                        name: 'local',
                    },
                },
            ],
        } as unknown as AuthOptions);

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

    it('Inits Auth with default strategy', async () => {
        const auth = new Auth({
            strategies: [
                {
                    strategy: LocalStrategyMock,
                    strategyOptions: {
                        name: 'local',
                    },
                },
            ],
        } as unknown as AuthOptions);

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
        const auth = new Auth({
            strategies: [
                {
                    strategy: LocalStrategyMock,
                    strategyOptions: {
                        name: 'local',
                    },
                },
            ],
        } as unknown as AuthOptions);

        mockStorageGet.mockReturnValue('local');

        const result = await auth.getStrategy();

        expect(mockStorageGet).toHaveBeenCalled();
        expect(result).toBeInstanceOf(LocalStrategyMock);
    });

    it('Throws exception when strategy is not set', async () => {
        const auth = new Auth({
            strategies: [
                {
                    strategy: LocalStrategyMock,
                    strategyOptions: {
                        name: 'local',
                    },
                },
            ],
        } as unknown as AuthOptions);

        mockStorageGet.mockReturnValue('');

        try {
            await auth.getStrategy();
        } catch (e: any) {
            expect(e.message).toBe('No strategy is set!');
        }

        expect(mockStorageGet).toHaveBeenCalled();
    });

    it('Throws exception when strategy is not supported', async () => {
        const auth = new Auth({
            strategies: [
                {
                    strategy: LocalStrategyMock,
                    strategyOptions: {
                        name: 'local',
                    },
                },
            ],
        } as unknown as AuthOptions);

        mockStorageGet.mockReturnValue('test');

        try {
            await auth.getStrategy();
        } catch (e: any) {
            expect(e.message).toBe('Strategy not supported: test');
        }

        expect(mockStorageGet).toHaveBeenCalled();
    });

    it('Does not throw exception when strategy is not set', async () => {
        const auth = new Auth({
            strategies: [
                {
                    strategy: LocalStrategyMock,
                    strategyOptions: {
                        name: 'local',
                    },
                },
            ],
        } as unknown as AuthOptions);

        mockStorageGet.mockReturnValue('');

        const result = await auth.getStrategy(false);

        expect(mockStorageGet).toHaveBeenCalled();
        expect(result).toBe(undefined);
    });
});
