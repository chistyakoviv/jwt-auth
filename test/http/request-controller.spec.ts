import {
    RefreshStrategyMock,
    mockRefreshTokens,
    DEFAULTS,
    RefreshStrategyOptions,
} from '../strategies/refresh-strategy.mock';
import { DEFAULTS as LOCAL_DEFAULTS } from '../strategies/local-strategy.mock';
import {
    AuthMock,
    mockSetHeader,
    mockInjectRequestInterceptor,
    mockEjectRequestInterceptor,
} from '../auth.mock';
import { defaultOptions } from '../../src/options';
import type { RefreshableStrategy } from '../../src/types/strategy';
import { RequestController } from '../../src/http/request-controller';
import { Auth } from '../../src/auth';
import { deepCopy } from '../../src/utils';

describe('Request controller', () => {
    let auth: Auth;
    let strategy: RefreshableStrategy;
    let controller: RequestController;

    beforeEach(async () => {
        const options = deepCopy(LOCAL_DEFAULTS);
        auth = new AuthMock(defaultOptions);
        strategy = new RefreshStrategyMock(auth, {
            ...options,
            ...(DEFAULTS as RefreshStrategyOptions),
        });
        controller = new RequestController(strategy);
        mockRefreshTokens.mockClear();
        AuthMock.mockClear();
        RefreshStrategyMock.mockClear();
        mockSetHeader.mockClear();
        mockInjectRequestInterceptor.mockClear();
        mockEjectRequestInterceptor.mockClear();
    });

    it('Sets header with default config', () => {
        const token = 'token_value';

        controller.setHeader(token);

        expect(mockSetHeader).toHaveBeenCalledWith('Authorization', token);
    });

    it('Sets header with custom token name', () => {
        const token = 'token_value';
        strategy.options.token.name = 'custom';

        controller.setHeader(token);

        expect(mockSetHeader).toHaveBeenCalledWith('custom', token);
    });

    it('Does not set header if token global is false', () => {
        const token = 'token_value';
        strategy.options.token.global = false;

        controller.setHeader(token);

        expect(mockSetHeader).not.toHaveBeenCalled();
    });

    it('Clears header is token global is true', () => {
        controller.clearHeader();

        expect(mockSetHeader).toHaveBeenCalledWith('Authorization', false);
    });

    it('Clears header with custom token name', () => {
        strategy.options.token.name = 'custom';

        controller.clearHeader();

        expect(mockSetHeader).toHaveBeenCalledWith('custom', false);
    });

    it('Initializes request interceptor', () => {
        controller.initializeRequestInterceptor();

        expect(mockInjectRequestInterceptor).toHaveBeenCalled();
    });

    it('Resets interceptor', () => {
        controller.interceptor = 42;

        controller.reset();

        expect(mockEjectRequestInterceptor).toHaveBeenCalledWith(42);
        expect(controller.interceptor).toBe(null);
    });
});
