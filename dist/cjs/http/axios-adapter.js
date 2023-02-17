"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AxiosAdapter = void 0;
var axios_1 = require("axios");
var AxiosAdapter = (function () {
    function AxiosAdapter() {
    }
    AxiosAdapter.prototype.request = function (params) {
        return axios_1.default.request(params);
    };
    AxiosAdapter.prototype.injectRequestInterceptor = function (fn) {
        return axios_1.default.interceptors.request.use(fn);
    };
    AxiosAdapter.prototype.ejectRequestInterceptor = function (id) {
        return axios_1.default.interceptors.request.eject(id);
    };
    AxiosAdapter.prototype.setHeader = function (name, value) {
        axios_1.default.defaults.headers.common[name] = value;
    };
    AxiosAdapter.prototype.hasHeader = function (name) {
        return Boolean(axios_1.default.defaults.headers.common[name]);
    };
    return AxiosAdapter;
}());
exports.AxiosAdapter = AxiosAdapter;
