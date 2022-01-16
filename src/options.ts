import { IStorage } from './types/storage';

export interface ModuleOptions {
    redirect: {
        login: string;
        logout: string;
        home: string;
    };
    storages: {
        [storage: string]: IStorage;
    };
}

export const deufaultOptions: ModuleOptions = {
    redirect: {
        login: '/login',
        logout: '/logout',
        home: '/',
    },
    storages: {},
};
