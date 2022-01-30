import { AggregatorStorage } from './aggregator-storage';
import { CookieStorage } from './cookie-storage';

describe('Aggregator storage', () => {
    let cookieStorage: CookieStorage;
    const storageKey = 'strategy';
    const storageValue = 'local';

    beforeEach(() => {
        cookieStorage = new CookieStorage();
    });

    it('Sets value', () => {
        const storage = new AggregatorStorage([cookieStorage]);
        const setCookieStorageSpy = jest.spyOn(cookieStorage, 'set');

        storage.set(storageKey, storageValue);

        expect(setCookieStorageSpy).toHaveBeenCalledWith(
            storageKey,
            storageValue,
        );
    });

    it('Gets value', () => {
        const storage = new AggregatorStorage([cookieStorage]);
        const getCookieStorageSpy = jest.spyOn(cookieStorage, 'get');

        storage.set(storageKey, storageValue);

        // Act
        const value = storage.get(storageKey);

        expect(getCookieStorageSpy).toHaveBeenCalledWith(storageKey);
        expect(value).toBe(storageValue);
    });

    it('Syncs value', () => {
        const storage = new AggregatorStorage([cookieStorage]);
        const getCookieStorageSpy = jest.spyOn(cookieStorage, 'get');
        const setCookieStorageSpy = jest.spyOn(cookieStorage, 'set');

        storage.set(storageKey, storageValue);

        // Act
        const value = storage.sync(storageKey);

        expect(getCookieStorageSpy).toHaveBeenCalledWith(storageKey);
        expect(setCookieStorageSpy).toHaveBeenCalledWith(
            storageKey,
            storageValue,
        );
        expect(value).toBe(storageValue);
    });

    it('Removes value', () => {
        const storage = new AggregatorStorage([cookieStorage]);
        const setCookieStorageSpy = jest.spyOn(cookieStorage, 'set');

        storage.remove(storageKey);

        expect(setCookieStorageSpy).toHaveBeenCalledWith(storageKey, false);
    });
});
