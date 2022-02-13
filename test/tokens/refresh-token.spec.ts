import { RefreshToken } from '../../src/tokens/refresh-token';
import {
    RefreshStrategyMock,
    mockSetHeader,
    mockClearHeader,
    DEFAULTS,
    RefreshStrategyOptions,
} from '../strategies/refresh-strategy.mock';
import { AuthMock } from '../auth.mock';
import type { RefreshableStrategy } from '../../src/types/strategy';
import type { Storage } from '../../src/types/storage';
import { TokenStatus } from '../../src/tokens/token-status';
import { defaultOptions } from '../../src/options';
import {
    CookieStorageMock,
    mockSet,
    mockGet,
    mockSync,
} from '../storages/cookie-storage.mock';

describe('Refresh token', () => {
    const VALID_TOKEN =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NDM1Njk5NzkxMjB9.AZtjy6w8CldzgviubiHsdkvBK0lVyeV2UD_4vES1CEI';
    const EXPIRATION_TIME = 1643569979120 * 1000;

    const auth = new AuthMock(defaultOptions);
    const strategy: RefreshableStrategy = new RefreshStrategyMock(
        auth,
        DEFAULTS as RefreshStrategyOptions,
    );
    const storage: Storage = new CookieStorageMock();
    const strategyKey =
        strategy.options.refreshToken.prefix + strategy.options.name;
    const expirationKey =
        strategy.options.refreshToken.expirationPrefix + strategy.options.name;

    beforeEach(async () => {
        mockSetHeader.mockClear();
        mockSet.mockClear();
        mockGet.mockClear();
        mockSync.mockClear();
        mockClearHeader.mockClear();
        AuthMock.mockClear();
        RefreshStrategyMock.mockClear();
    });

    it('Sets token', () => {
        const token = new RefreshToken(strategy, storage);
        const EXPECT_TOKEN_VALUE = `${VALID_TOKEN}`;

        const tokenValue = token.set(VALID_TOKEN);

        expect(tokenValue).toBe(EXPECT_TOKEN_VALUE);
        expect(mockSet).toBeCalledWith(strategyKey, EXPECT_TOKEN_VALUE);
        expect(mockSet).toBeCalledWith(expirationKey, EXPIRATION_TIME);
    });

    it('Gets token', () => {
        const token = new RefreshToken(strategy, storage);
        const EXPECT_TOKEN_VALUE = `${VALID_TOKEN}`;

        mockGet.mockImplementation(() => EXPECT_TOKEN_VALUE);

        const tokenValue = token.get();

        expect(tokenValue).toBe(EXPECT_TOKEN_VALUE);
        expect(mockGet).toBeCalledWith(strategyKey);
    });

    it('Syncs token', () => {
        const token = new RefreshToken(strategy, storage);
        const EXPECT_TOKEN_VALUE = `${VALID_TOKEN}`;

        mockSync.mockImplementation(() => EXPECT_TOKEN_VALUE);

        const tokenValue = token.sync();

        expect(tokenValue).toBe(EXPECT_TOKEN_VALUE);
        expect(mockSync).toBeCalledWith(strategyKey);
        expect(mockSync).toBeCalledWith(expirationKey);
    });

    it('Resets token', () => {
        const token = new RefreshToken(strategy, storage);

        token.reset();

        expect(mockSet).toBeCalledWith(strategyKey, false);
        expect(mockSet).toBeCalledWith(expirationKey, false);
    });

    it('Returns token status', () => {
        const token = new RefreshToken(strategy, storage);

        const status = token.status();

        expect(status).toBeInstanceOf(TokenStatus);
    });
});
