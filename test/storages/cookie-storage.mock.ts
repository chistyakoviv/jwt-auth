import { CookieStorage } from '../../src/storages/cookie-storage';

export const mockGet = jest.fn();
export const mockSet = jest.fn();
export const mockSync = jest.fn();
export const mockRemove = jest.fn();

export const CookieStorageMock = jest.fn().mockImplementation(() => {
    return {
        get: mockGet,
        set: mockSet,
        sync: mockSync,
        remove: mockRemove,
    };
}) as jest.MockedClass<typeof CookieStorage>;
