import { AggregatorStorage } from './aggregator-storage';
import { CookieStorage } from './cookie-storage';
import { Storage } from '../types/storage';

const mockGet = jest.fn();
const mockSet = jest.fn();
const mockSync = jest.fn();
const mockRemove = jest.fn();

jest.mock('./cookie-storage', () => {
    return {
        CookieStorage: jest.fn().mockImplementation(() => {
            return {
                get: mockGet,
                set: mockSet,
                sync: mockSync,
                remove: mockRemove,
            };
        }),
    };
});

describe('Aggregator storage', () => {
    const MockCookieStorage = CookieStorage as jest.MockedClass<
        typeof CookieStorage
    >;
    const storageMock: Storage = new MockCookieStorage();
    const storageKey = 'strategy';
    const storageValue = 'local';

    beforeEach(() => {
        mockSet.mockClear();
        mockGet.mockClear();
        mockSync.mockClear();
        mockRemove.mockClear();
        MockCookieStorage.mockClear();
    });

    it('Sets value', () => {
        const storage = new AggregatorStorage([storageMock]);

        storage.set(storageKey, storageValue);

        expect(mockSet).toHaveBeenCalledWith(storageKey, storageValue);
    });

    it('Gets value', () => {
        const storage = new AggregatorStorage([storageMock]);

        mockGet.mockImplementation((key) => storageValue);

        const value = storage.get(storageKey);

        expect(mockGet).toHaveBeenCalledWith(storageKey);
        expect(value).toBe(storageValue);
    });

    it('Syncs value', () => {
        const storage = new AggregatorStorage([storageMock]);

        mockGet.mockImplementation((key) => storageValue);

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
