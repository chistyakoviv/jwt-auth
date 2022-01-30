import { TokenStatus } from './token-status';

describe('Token status', () => {
    const NOT_EXPIRED = Date.now() + 10000;
    const EXPIRED = Date.now() - 10000;
    const INVALID_EXPIRATION = false;

    it('checks all statuses of not expired token', () => {
        const tokenStatus = new TokenStatus(NOT_EXPIRED);

        expect(tokenStatus.unknown()).toBe(false);
        expect(tokenStatus.expired()).toBe(false);
        expect(tokenStatus.valid()).toBe(true);
    });

    it('checks all statuses of expired token', () => {
        const tokenStatus = new TokenStatus(EXPIRED);

        expect(tokenStatus.unknown()).toBe(false);
        expect(tokenStatus.expired()).toBe(true);
        expect(tokenStatus.valid()).toBe(false);
    });

    it('checks all statuses of invalid expiration time', () => {
        const tokenStatus = new TokenStatus(INVALID_EXPIRATION);

        expect(tokenStatus.unknown()).toBe(true);
        expect(tokenStatus.expired()).toBe(false);
        expect(tokenStatus.valid()).toBe(false);
    });
});
