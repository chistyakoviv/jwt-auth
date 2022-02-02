export const mockSetHeader = jest.fn();
export const mockClearHeader = jest.fn();
export const mockInitializeRequestInterceptor = jest.fn();
export const mockReset = jest.fn();

export const requestControllerMock = {
    setHeader: mockSetHeader,
    clearHeader: mockClearHeader,
    initializeRequestInterceptor: mockInitializeRequestInterceptor,
    reset: mockReset,
};
