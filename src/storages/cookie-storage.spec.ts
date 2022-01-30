import { CookieStorage } from './cookie-storage';

describe('Cookie storage', () => {
    const cookieName = 'strategy';

    beforeEach(() => {
        // Reset cookies before each test
        document.cookie = `${cookieName}=1; expires=1 Jan 1970 00:00:00 GMT;`;
    });

    it('Sets string value with default settings', () => {
        const storage = new CookieStorage();
        const EXPECT_VALUE = 'auth.strategy=local';

        storage.set(cookieName, 'local');

        expect(document.cookie).toBe(EXPECT_VALUE);
    });

    it('Sets removing value with default settings', () => {
        const storage = new CookieStorage();
        const EXPECT_VALUE = 'auth.strategy=false';

        storage.set(cookieName, null);

        expect(document.cookie).toBe(EXPECT_VALUE);
    });

    it('Removes value with default settings', () => {
        const storage = new CookieStorage();
        const EXPECT_VALUE = 'auth.strategy=false';

        storage.remove(cookieName);

        expect(document.cookie).toBe(EXPECT_VALUE);
    });

    it('Gets string value with default settings', () => {
        const storage = new CookieStorage();
        const EXPECT_VALUE = 'local';

        storage.set(cookieName, 'local');

        // Act
        const value = storage.get(cookieName);

        expect(value).toBe(EXPECT_VALUE);
    });
});
