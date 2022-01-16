import { IStorage } from './types/storage';

export interface AuthOptions {
    redirect: {
        login: string;
        logout: string;
        home: string;
    };
    storages: IStorage[];
}

export const deufaultOptions: AuthOptions = {
    redirect: {
        login: '/login',
        logout: '/logout',
        home: '/',
    },
    storages: [],
};
