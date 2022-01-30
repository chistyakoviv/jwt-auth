import { CookieStorage, CookieStorageOptions } from './cookie-storage';

describe('Cookie storage', () => {
    const cookieName = 'strategy';

    afterEach(() => {
        // Reset cookies after each test
        document.cookie = `auth.${cookieName}=1; expires=1 Jan 1970 00:00:00 GMT;`;
        document.cookie = `test.${cookieName}=1; expires=1 Jan 1970 00:00:00 GMT;`;
    });

    it('Sets string value with default options', () => {
        const storage = new CookieStorage();
        const EXPECT_VALUE = 'auth.strategy=local';

        storage.set(cookieName, 'local');

        expect(document.cookie).toBe(EXPECT_VALUE);
    });

    it('Sets string value with custom prefix', () => {
        const options: CookieStorageOptions = { prefix: 'test.' };
        const storage = new CookieStorage(options);
        const EXPECT_VALUE = 'test.strategy=local';

        storage.set(cookieName, 'local');

        expect(document.cookie).toBe(EXPECT_VALUE);
    });

    it('Sets removing value with default options', () => {
        const storage = new CookieStorage();
        const EXPECT_VALUE = 'auth.strategy=false';

        storage.set(cookieName, null);

        expect(document.cookie).toBe(EXPECT_VALUE);
    });

    it('Sets removing value with custom prefix', () => {
        const options: CookieStorageOptions = { prefix: 'test.' };
        const storage = new CookieStorage(options);
        const EXPECT_VALUE = 'test.strategy=false';

        storage.set(cookieName, null);

        expect(document.cookie).toBe(EXPECT_VALUE);
    });

    it('Removes value with default options', () => {
        const storage = new CookieStorage();
        const EXPECT_VALUE = 'auth.strategy=false';

        storage.remove(cookieName);

        expect(document.cookie).toBe(EXPECT_VALUE);
    });

    it('Removes value with custom prefix', () => {
        const options: CookieStorageOptions = { prefix: 'test.' };
        const storage = new CookieStorage(options);
        const EXPECT_VALUE = 'test.strategy=false';

        storage.remove(cookieName);

        expect(document.cookie).toBe(EXPECT_VALUE);
    });

    it('Gets string value with default options', () => {
        const storage = new CookieStorage();
        const EXPECT_VALUE = 'local';

        storage.set(cookieName, 'local');

        // Act
        const value = storage.get(cookieName);

        expect(value).toBe(EXPECT_VALUE);
    });

    it('Gets string value with custom prefix', () => {
        const options: CookieStorageOptions = { prefix: 'test.' };
        const storage = new CookieStorage(options);
        const EXPECT_VALUE = 'local';

        storage.set(cookieName, 'local');

        // Act
        const value = storage.get(cookieName);

        expect(value).toBe(EXPECT_VALUE);
    });
});
