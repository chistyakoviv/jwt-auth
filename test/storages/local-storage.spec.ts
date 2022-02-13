import {
    LocalStorage,
    LocalStorageOptions,
} from '../../src/storages/local-storage';
import { decodeValue } from '../../src/utils';

describe('Local storage', () => {
    const key = 'strategy';

    afterEach(() => {
        localStorage.clear();
    });

    it('Sets string value with default options', () => {
        const storage = new LocalStorage();

        storage.set(key, 'local');

        expect(localStorage.getItem('auth.strategy')).toBe('local');
    });

    it('Sets string value with custom prefix', () => {
        const options: LocalStorageOptions = { prefix: 'test.' };
        const storage = new LocalStorage(options);

        storage.set(key, 'local');

        expect(localStorage.getItem('test.strategy')).toBe('local');
    });

    it('Sets removing value with default options', () => {
        const storage = new LocalStorage();

        storage.set(key, null);

        expect(decodeValue(localStorage.getItem('auth.strategy'))).toBe(false);
    });

    it('Sets removing value with custom prefix', () => {
        const options: LocalStorageOptions = { prefix: 'test.' };
        const storage = new LocalStorage(options);

        storage.set(key, null);

        expect(decodeValue(localStorage.getItem('test.strategy'))).toBe(false);
    });

    it('Removes value with default options', () => {
        const storage = new LocalStorage();

        storage.remove(key);

        expect(decodeValue(localStorage.getItem('auth.strategy'))).toBe(false);
    });

    it('Removes value with custom prefix', () => {
        const options: LocalStorageOptions = { prefix: 'test.' };
        const storage = new LocalStorage(options);

        storage.remove(key);

        expect(decodeValue(localStorage.getItem('test.strategy'))).toBe(false);
    });

    it('Gets string value with default options', () => {
        const storage = new LocalStorage();
        const EXPECT_VALUE = 'local';

        storage.set(key, 'local');

        // Act
        const value = storage.get(key);

        expect(value).toBe(EXPECT_VALUE);
    });

    it('Gets string value with custom prefix', () => {
        const options: LocalStorageOptions = { prefix: 'test.' };
        const storage = new LocalStorage(options);
        const EXPECT_VALUE = 'local';

        storage.set(key, 'local');

        // Act
        const value = storage.get(key);

        expect(value).toBe(EXPECT_VALUE);
    });
});
