"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Token = void 0;
var jwt_decode_1 = require("jwt-decode");
var utils_1 = require("../utils");
var token_status_1 = require("./token-status");
var Token = (function () {
    function Token(strategy, storage) {
        this.strategy = strategy;
        this.storage = storage;
        this.strategyKey =
            this.strategy.options.token.prefix + this.strategy.options.name;
        this.expirationKey =
            this.strategy.options.token.expirationPrefix +
                this.strategy.options.name;
    }
    Token.prototype.get = function () {
        return this.storage.get(this.strategyKey);
    };
    Token.prototype.set = function (tokenValue) {
        var token = (0, utils_1.addTokenPrefix)(tokenValue, this.strategy.options.token.type);
        this._setToken(token);
        this._updateExpiration(token);
        if (typeof token === 'string') {
            this.strategy.requestController.setHeader(token);
        }
        return token;
    };
    Token.prototype.sync = function () {
        var token = this._syncToken();
        this._syncExpiration();
        if (typeof token === 'string') {
            this.strategy.requestController.setHeader(token);
        }
        return token;
    };
    Token.prototype.reset = function () {
        this.strategy.requestController.clearHeader();
        this._setToken(false);
        this._setExpiration(false);
    };
    Token.prototype.status = function () {
        return new token_status_1.TokenStatus(this._getExpiration());
    };
    Token.prototype._getExpiration = function () {
        return this.storage.get(this.expirationKey);
    };
    Token.prototype._setExpiration = function (expiration) {
        return this.storage.set(this.expirationKey, expiration);
    };
    Token.prototype._syncExpiration = function () {
        return this.storage.sync(this.expirationKey);
    };
    Token.prototype._updateExpiration = function (token) {
        var tokenExpiration;
        var _tokenIssuedAtMillis = Date.now();
        var _tokenTTLMillis = Number(this.strategy.options.token.maxAge) * 1000;
        var _tokenExpiresAtMillis = _tokenTTLMillis
            ? _tokenIssuedAtMillis + _tokenTTLMillis
            : 0;
        try {
            var exp = (0, jwt_decode_1.default)(token + '').exp;
            tokenExpiration = exp ? exp * 1000 : _tokenExpiresAtMillis;
        }
        catch (error) {
            tokenExpiration = _tokenExpiresAtMillis;
            if (!(error && error.name === 'InvalidTokenError')) {
                throw error;
            }
        }
        return this._setExpiration(tokenExpiration || false);
    };
    Token.prototype._setToken = function (token) {
        return this.storage.set(this.strategyKey, token);
    };
    Token.prototype._syncToken = function () {
        return this.storage.sync(this.strategyKey);
    };
    return Token;
}());
exports.Token = Token;
