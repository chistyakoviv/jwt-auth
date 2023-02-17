"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshController = void 0;
var RefreshController = (function () {
    function RefreshController(strategy) {
        this.strategy = strategy;
        this.refreshPromise = null;
        this.auth = strategy.auth;
    }
    RefreshController.prototype.handleRefresh = function () {
        if (this.refreshPromise) {
            return this.refreshPromise;
        }
        return this._doRefresh();
    };
    RefreshController.prototype._doRefresh = function () {
        var _this = this;
        this.refreshPromise = new Promise(function (resolve, reject) {
            _this.strategy
                .refreshTokens()
                .then(function (response) {
                _this.refreshPromise = null;
                resolve(response);
            })
                .catch(function (error) {
                _this.refreshPromise = null;
                reject(error);
            });
        });
        return this.refreshPromise;
    };
    return RefreshController;
}());
exports.RefreshController = RefreshController;
