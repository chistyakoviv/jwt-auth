import { AggregatorStorage } from './aggregator-storage';
import {
    CookieStorageMock,
    mockGet,
    mockSet,
    mockSync,
    mockRemove,
} from './cookie-storage.mock';
import { Storage } from '../types/storage';

describe('Aggregator storage', () => {
    const storageMock: Storage = new CookieStorageMock();
    const storageKey = 'strategy';
    const storageValue = 'local';

    beforeEach(() => {
        mockSet.mockClear();
        mockGet.mockClear();
        mockSync.mockClear();
        mockRemove.mockClear();
    });

    it('Sets value', () => {
        const storage = new AggregatorStorage([storageMock]);

        storage.set(storageKey, storageValue);

        expect(mockSet).toHaveBeenCalledWith(storageKey, storageValue);
    });

    it('Gets value', () => {
        const storage = new AggregatorStorage([storageMock]);

        mockGet.mockImplementation(() => storageValue);

        const value = storage.get(storageKey);

        expect(mockGet).toHaveBeenCalledWith(storageKey);
        expect(value).toBe(storageValue);
    });

    it('Syncs value', () => {
        const storage = new AggregatorStorage([storageMock]);

        mockGet.mockImplementation(() => storageValue);

        const value = storage.sync(storageKey);

        expect(mockGet).toHaveBeenCalledWith(storageKey);
        expect(mockSet).toHaveBeenCalledWith(storageKey, storageValue);
        expect(value).toBe(storageValue);
    });

    it('Removes value', () => {
        const storage = new AggregatorStorage([storageMock]);

        storage.remove(storageKey);

        expect(mockSet).toHaveBeenCalledWith(storageKey, false);
    });
});
