import { RefreshController } from './refresh-controller';

export const mockHandleRefresh = jest.fn();

export const RefreshControllerMock = jest.fn().mockImplementation(() => {
    return {
        handleRefresh: mockHandleRefresh,
    };
}) as jest.MockedClass<typeof RefreshController>;
