"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CookieStorage = void 0;
var cookie_1 = require("cookie");
var utils_1 = require("../utils");
var DEFAULTS = {
    prefix: 'auth.',
    cookieOptions: {
        path: '/',
    },
};
var CookieStorage = (function () {
    function CookieStorage(options) {
        this.options = (0, utils_1.merge)(options, DEFAULTS);
    }
    CookieStorage.prototype.set = function (key, value) {
        if ((0, utils_1.isUnset)(value)) {
            this.remove(key);
            return value;
        }
        document.cookie = (0, cookie_1.serialize)(this.options.prefix + key, (0, utils_1.encodeValue)(value), this.options.cookieOptions);
        return value;
    };
    CookieStorage.prototype.get = function (key) {
        var cookieKey = this.options.prefix + key;
        var cookies = (0, cookie_1.parse)(document.cookie) || {};
        var value = cookies[cookieKey]
            ? decodeURIComponent(cookies[cookieKey])
            : undefined;
        return (0, utils_1.decodeValue)(value);
    };
    CookieStorage.prototype.sync = function (key) {
        var value = this.get(key);
        return value;
    };
    CookieStorage.prototype.remove = function (key) {
        this.set(key, false);
    };
    return CookieStorage;
}());
exports.CookieStorage = CookieStorage;
