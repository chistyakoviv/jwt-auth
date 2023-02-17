"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AggregatorStorage = void 0;
var utils_1 = require("../utils");
var AggregatorStorage = (function () {
    function AggregatorStorage(storages) {
        this.storages = storages;
    }
    AggregatorStorage.prototype.set = function (key, value) {
        this.storages.forEach(function (storage) { return storage.set(key, value); });
        return value;
    };
    AggregatorStorage.prototype.get = function (key) {
        for (var i = 0; i < this.storages.length; i++) {
            var storage = this.storages[i];
            var value = storage.get(key);
            if ((0, utils_1.isSet)(value))
                return value;
        }
        return null;
    };
    AggregatorStorage.prototype.sync = function (key) {
        var value = this.get(key);
        if ((0, utils_1.isSet)(value)) {
            this.set(key, value);
        }
        return value;
    };
    AggregatorStorage.prototype.remove = function (key) {
        this.set(key, false);
    };
    return AggregatorStorage;
}());
exports.AggregatorStorage = AggregatorStorage;
