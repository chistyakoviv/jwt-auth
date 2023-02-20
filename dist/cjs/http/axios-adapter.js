"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AxiosAdapter = void 0;
var axios_1 = require("axios");
var AxiosAdapter = (function () {
    function AxiosAdapter(axiosInstance) {
        this.axios = axiosInstance ? axiosInstance : axios_1.default;
    }
    AxiosAdapter.prototype.request = function (params) {
        return this.axios.request(params);
    };
    AxiosAdapter.prototype.injectRequestInterceptor = function (fn) {
        return this.axios.interceptors.request.use(fn);
    };
    AxiosAdapter.prototype.ejectRequestInterceptor = function (id) {
        return this.axios.interceptors.request.eject(id);
    };
    AxiosAdapter.prototype.setHeader = function (name, value) {
        this.axios.defaults.headers.common[name] = value;
    };
    AxiosAdapter.prototype.hasHeader = function (name) {
        return Boolean(this.axios.defaults.headers.common[name]);
    };
    return AxiosAdapter;
}());
exports.AxiosAdapter = AxiosAdapter;
