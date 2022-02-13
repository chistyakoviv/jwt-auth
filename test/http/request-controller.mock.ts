import { RequestController } from '../../src/http/request-controller';

export const mockSetHeader = jest.fn();
export const mockClearHeader = jest.fn();
export const mockInitializeRequestInterceptor = jest.fn();
export const mockReset = jest.fn();

export const RequestControllerMock = jest
    .fn()
    .mockImplementation((strategy) => {
        return {
            strategy,
            setHeader: mockSetHeader,
            clearHeader: mockClearHeader,
            initializeRequestInterceptor: mockInitializeRequestInterceptor,
            reset: mockReset,
        };
    }) as jest.MockedClass<typeof RequestController>;
