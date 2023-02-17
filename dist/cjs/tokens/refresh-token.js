"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshToken = void 0;
var jwt_decode_1 = require("jwt-decode");
var utils_1 = require("../utils");
var token_status_1 = require("./token-status");
var RefreshToken = (function () {
    function RefreshToken(strategy, storage) {
        this.strategy = strategy;
        this.storage = storage;
        this.strategyKey =
            this.strategy.options.refreshToken.prefix +
                this.strategy.options.name;
        this.expirationKey =
            this.strategy.options.refreshToken.expirationPrefix +
                this.strategy.options.name;
    }
    RefreshToken.prototype.get = function () {
        return this.storage.get(this.strategyKey);
    };
    RefreshToken.prototype.set = function (tokenValue) {
        var refreshToken = (0, utils_1.addTokenPrefix)(tokenValue, this.strategy.options.refreshToken.type);
        this._setToken(refreshToken);
        this._updateExpiration(refreshToken);
        return refreshToken;
    };
    RefreshToken.prototype.sync = function () {
        var refreshToken = this._syncToken();
        this._syncExpiration();
        return refreshToken;
    };
    RefreshToken.prototype.reset = function () {
        this._setToken(false);
        this._setExpiration(false);
    };
    RefreshToken.prototype.status = function () {
        return new token_status_1.TokenStatus(this._getExpiration());
    };
    RefreshToken.prototype._getExpiration = function () {
        return this.storage.get(this.expirationKey);
    };
    RefreshToken.prototype._setExpiration = function (expiration) {
        return this.storage.set(this.expirationKey, expiration);
    };
    RefreshToken.prototype._syncExpiration = function () {
        return this.storage.sync(this.expirationKey);
    };
    RefreshToken.prototype._updateExpiration = function (refreshToken) {
        var refreshTokenExpiration;
        var _tokenIssuedAtMillis = Date.now();
        var _tokenTTLMillis = Number(this.strategy.options.refreshToken.maxAge) * 1000;
        var _tokenExpiresAtMillis = _tokenTTLMillis
            ? _tokenIssuedAtMillis + _tokenTTLMillis
            : 0;
        try {
            var exp = (0, jwt_decode_1.default)(refreshToken + '').exp;
            refreshTokenExpiration = exp ? exp * 1000 : _tokenExpiresAtMillis;
        }
        catch (error) {
            refreshTokenExpiration = _tokenExpiresAtMillis;
            if (!(error && error.name === 'InvalidTokenError')) {
                throw error;
            }
        }
        return this._setExpiration(refreshTokenExpiration || false);
    };
    RefreshToken.prototype._setToken = function (refreshToken) {
        return this.storage.set(this.strategyKey, refreshToken);
    };
    RefreshToken.prototype._syncToken = function () {
        return this.storage.sync(this.strategyKey);
    };
    return RefreshToken;
}());
exports.RefreshToken = RefreshToken;
