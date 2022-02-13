import {
    RefreshStrategyMock,
    mockRefreshTokens,
    DEFAULTS,
    RefreshStrategyOptions,
} from '../strategies/refresh-strategy.mock';
import { AuthMock } from '../auth.mock';
import { defaultOptions } from '../../src/options';
import type { RefreshableStrategy } from '../../src/types/strategy';
import { RefreshController } from '../../src/http/refresh-controller';

describe('Refresh controller', () => {
    const auth = new AuthMock(defaultOptions);
    const strategy: RefreshableStrategy = new RefreshStrategyMock(
        auth,
        DEFAULTS as RefreshStrategyOptions,
    );

    beforeEach(async () => {
        mockRefreshTokens.mockClear();
        AuthMock.mockClear();
        RefreshStrategyMock.mockClear();
    });

    it('Handles refresh', async () => {
        const controller = new RefreshController(strategy);

        mockRefreshTokens.mockResolvedValue({ status: 200 });

        const result = await controller.handleRefresh();

        expect(mockRefreshTokens).toHaveBeenCalled();
        expect(result).toStrictEqual({ status: 200 });
    });
});
