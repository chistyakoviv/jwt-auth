import { Token } from '../../src/tokens/token';
import {
    LocalStrategyMock,
    mockSetHeader,
    mockClearHeader,
    DEFAULTS,
} from '../strategies/local-strategy.mock';
import { AuthMock } from '../auth.mock';
import type { TokenableStrategy } from '../../src/types/strategy';
import type { Storage } from '../../src/types/storage';
import { TokenStatus } from '../../src/tokens/token-status';
import { defaultOptions } from '../../src/options';
import {
    CookieStorageMock,
    mockSet,
    mockGet,
    mockSync,
} from '../storages/cookie-storage.mock';

describe('Token', () => {
    const VALID_TOKEN =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NDM1Njk5NzkxMjB9.AZtjy6w8CldzgviubiHsdkvBK0lVyeV2UD_4vES1CEI';
    const EXPIRATION_TIME = 1643569979120 * 1000;

    const auth = new AuthMock(defaultOptions);
    const strategy: TokenableStrategy = new LocalStrategyMock(auth, DEFAULTS);
    const storage: Storage = new CookieStorageMock();
    const strategyKey = strategy.options.token.prefix + strategy.options.name;
    const expirationKey =
        strategy.options.token.expirationPrefix + strategy.options.name;

    beforeEach(async () => {
        mockSetHeader.mockClear();
        mockSet.mockClear();
        mockGet.mockClear();
        mockSync.mockClear();
        mockClearHeader.mockClear();
        AuthMock.mockClear();
        LocalStrategyMock.mockClear();
    });

    it('Sets token', () => {
        const token = new Token(strategy, storage);
        const EXPECT_TOKEN_VALUE = `${strategy.options.token.type} ${VALID_TOKEN}`;

        const tokenValue = token.set(VALID_TOKEN);

        expect(tokenValue).toBe(EXPECT_TOKEN_VALUE);
        expect(mockSetHeader).toBeCalledWith(EXPECT_TOKEN_VALUE);
        expect(mockSet).toBeCalledWith(strategyKey, EXPECT_TOKEN_VALUE);
        expect(mockSet).toBeCalledWith(expirationKey, EXPIRATION_TIME);
    });

    it('Gets token', () => {
        const token = new Token(strategy, storage);
        const EXPECT_TOKEN_VALUE = `${strategy.options.token.type} ${VALID_TOKEN}`;

        mockGet.mockImplementation(() => EXPECT_TOKEN_VALUE);

        const tokenValue = token.get();

        expect(tokenValue).toBe(EXPECT_TOKEN_VALUE);
        expect(mockGet).toBeCalledWith(strategyKey);
    });

    it('Syncs token', () => {
        const token = new Token(strategy, storage);
        const EXPECT_TOKEN_VALUE = `${strategy.options.token.type} ${VALID_TOKEN}`;

        mockSync.mockImplementation(() => EXPECT_TOKEN_VALUE);

        const tokenValue = token.sync();

        expect(tokenValue).toBe(EXPECT_TOKEN_VALUE);
        expect(mockSetHeader).toBeCalledWith(EXPECT_TOKEN_VALUE);
        expect(mockSync).toBeCalledWith(strategyKey);
        expect(mockSync).toBeCalledWith(expirationKey);
    });

    it('Resets token', () => {
        const token = new Token(strategy, storage);

        token.reset();

        expect(mockClearHeader).toHaveBeenCalled();
        expect(mockSet).toBeCalledWith(strategyKey, false);
        expect(mockSet).toBeCalledWith(expirationKey, false);
    });

    it('Returns token status', () => {
        const token = new Token(strategy, storage);

        const status = token.status();

        expect(status).toBeInstanceOf(TokenStatus);
    });
});
