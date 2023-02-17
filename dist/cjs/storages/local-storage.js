"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorage = void 0;
var utils_1 = require("../utils");
var utils_2 = require("../utils");
var DEFAULTS = {
    prefix: 'auth.',
    ignoreExceptions: false,
};
var LocalStorage = (function () {
    function LocalStorage(options) {
        this.options = (0, utils_2.merge)(options, DEFAULTS);
    }
    LocalStorage.prototype.set = function (key, value) {
        if (localStorage === undefined)
            return value;
        if ((0, utils_2.isUnset)(value)) {
            this.remove(key);
            return value;
        }
        try {
            localStorage.setItem(this.options.prefix + key, (0, utils_2.encodeValue)(value));
        }
        catch (e) {
            if (!this.options.ignoreExceptions) {
                throw e;
            }
        }
        return value;
    };
    LocalStorage.prototype.get = function (key) {
        if (localStorage === undefined)
            return null;
        var value = localStorage.getItem(this.options.prefix + key);
        return (0, utils_1.decodeValue)(value);
    };
    LocalStorage.prototype.sync = function (key) {
        var value = this.get(key);
        if ((0, utils_1.isSet)(value)) {
            this.set(key, value);
        }
        return value;
    };
    LocalStorage.prototype.remove = function (key) {
        this.set(key, false);
    };
    return LocalStorage;
}());
exports.LocalStorage = LocalStorage;
