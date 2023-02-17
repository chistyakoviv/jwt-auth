"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultOptions = void 0;
var axios_adapter_1 = require("./http/axios-adapter");
exports.defaultOptions = {
    redirect: {
        login: '/login',
        logout: '/logout',
        home: '/',
    },
    httpClient: axios_adapter_1.AxiosAdapter,
    storages: [],
    strategies: [],
};
