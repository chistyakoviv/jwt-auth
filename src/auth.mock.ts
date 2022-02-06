export * from './http/axios-adapter.mock';
import { Auth } from './auth';
import { AxiosAdapterMock } from './http/axios-adapter.mock';

export const AuthMock = jest.fn().mockImplementation(() => {
    return {
        httpClient: new AxiosAdapterMock(),
    };
}) as jest.MockedClass<typeof Auth>;
