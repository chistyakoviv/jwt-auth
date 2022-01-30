import { Token } from './token';
import { CookieStorage } from '../storages/cookie-storage';
import { LocalStrategy } from '../strategies/local-strategy';
import { Auth } from '../auth';
import { TokenableStrategy } from '../types/strategy';
import { Storage } from '../types/storage';
import { TokenStatus } from './token-status';

describe('Token', () => {
    let auth: Auth;
    let strategy: TokenableStrategy;
    let storage: Storage;
    const VALID_TOKEN =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NDM1Njk5NzkxMjB9.AZtjy6w8CldzgviubiHsdkvBK0lVyeV2UD_4vES1CEI';
    const EXPIRATION_TIME = 1643569979120 * 1000;

    let strategyKey: string;
    let expirationKey: string;

    beforeEach(async () => {
        auth = new Auth({
            storages: [new CookieStorage()],
            strategies: [
                {
                    strategy: LocalStrategy,
                    strategyOptions: {
                        name: 'local',
                    },
                },
            ],
        });
        auth.init();
        strategy = auth.getStrategy() as TokenableStrategy;
        strategyKey = strategy.options.token.prefix + strategy.options.name;
        expirationKey =
            strategy.options.token.expirationPrefix + strategy.options.name;
        storage = auth.storage;
    });

    it('Sets token', () => {
        const token = new Token(strategy, storage);
        const EXPECT_TOKEN_VALUE = `${strategy.options.token.type} ${VALID_TOKEN}`;
        const setHeaderSpy = jest.spyOn(
            strategy.requestController,
            'setHeader',
        );
        const setStorageSpy = jest.spyOn(storage, 'set');

        const tokenValue = token.set(VALID_TOKEN);

        expect(tokenValue).toBe(EXPECT_TOKEN_VALUE);
        expect(setHeaderSpy).toBeCalledWith(EXPECT_TOKEN_VALUE);
        expect(setStorageSpy).toBeCalledWith(strategyKey, EXPECT_TOKEN_VALUE);
        expect(setStorageSpy).toBeCalledWith(expirationKey, EXPIRATION_TIME);
    });

    it('Gets token', () => {
        const token = new Token(strategy, storage);
        const EXPECT_TOKEN_VALUE = `${strategy.options.token.type} ${VALID_TOKEN}`;
        const getStorageSpy = jest.spyOn(storage, 'get');

        token.set(VALID_TOKEN);

        // Act
        const tokenValue = token.get();

        expect(tokenValue).toBe(EXPECT_TOKEN_VALUE);
        expect(getStorageSpy).toBeCalledWith(strategyKey);
    });

    it('Syncs token', () => {
        const token = new Token(strategy, storage);
        const EXPECT_TOKEN_VALUE = `${strategy.options.token.type} ${VALID_TOKEN}`;
        const setHeaderSpy = jest.spyOn(
            strategy.requestController,
            'setHeader',
        );
        const syncStorageSpy = jest.spyOn(storage, 'sync');
        storage.set(strategyKey, EXPECT_TOKEN_VALUE);

        // Act
        const tokenValue = token.sync();

        expect(tokenValue).toBe(EXPECT_TOKEN_VALUE);
        expect(setHeaderSpy).toBeCalledWith(EXPECT_TOKEN_VALUE);
        expect(syncStorageSpy).toBeCalledWith(strategyKey);
        expect(syncStorageSpy).toBeCalledWith(expirationKey);
    });

    it('Resets token', () => {
        const token = new Token(strategy, storage);
        const clearHeaderSpy = jest.spyOn(
            strategy.requestController,
            'clearHeader',
        );
        const setStorageSpy = jest.spyOn(storage, 'set');

        token.reset();

        expect(clearHeaderSpy).toHaveBeenCalled();
        expect(setStorageSpy).toBeCalledWith(strategyKey, false);
        expect(setStorageSpy).toBeCalledWith(expirationKey, false);
    });

    it('Returns token status', () => {
        const token = new Token(strategy, storage);

        const status = token.status();

        expect(status).toBeInstanceOf(TokenStatus);
    });
});
