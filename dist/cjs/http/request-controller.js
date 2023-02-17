"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestController = void 0;
var tslib_1 = require("tslib");
var expired_auth_session_error_1 = require("../errors/expired-auth-session-error");
var RequestController = (function () {
    function RequestController(strategy) {
        this.strategy = strategy;
        this.httpClient = this.strategy.auth.httpClient;
        this.interceptor = null;
    }
    RequestController.prototype.setHeader = function (token) {
        if (this.strategy.options.token.global) {
            this.httpClient.setHeader(this.strategy.options.token.name, token);
        }
    };
    RequestController.prototype.clearHeader = function () {
        if (this.strategy.options.token.global) {
            this.httpClient.setHeader(this.strategy.options.token.name, false);
        }
    };
    RequestController.prototype.initializeRequestInterceptor = function (refreshEndpoint) {
        var _this = this;
        this.interceptor = this.httpClient.injectRequestInterceptor(function (config) { return (0, tslib_1.__awaiter)(_this, void 0, void 0, function () {
            var _a, valid, tokenExpired, refreshTokenExpired, isRefreshable, isValid, token;
            var _this = this;
            return (0, tslib_1.__generator)(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this._needToken(config) ||
                            config.url === refreshEndpoint) {
                            return [2, config];
                        }
                        _a = this.strategy.check(true), valid = _a.valid, tokenExpired = _a.tokenExpired, refreshTokenExpired = _a.refreshTokenExpired, isRefreshable = _a.isRefreshable;
                        isValid = valid;
                        if (refreshTokenExpired) {
                            this.strategy.reset();
                            throw new expired_auth_session_error_1.ExpiredAuthSessionError();
                        }
                        if (!tokenExpired) return [3, 2];
                        if (!isRefreshable) {
                            this.strategy.reset();
                            throw new expired_auth_session_error_1.ExpiredAuthSessionError();
                        }
                        return [4, this.strategy
                                .refreshTokens()
                                .then(function () { return true; })
                                .catch(function () {
                                _this.strategy.reset();
                                throw new expired_auth_session_error_1.ExpiredAuthSessionError();
                            })];
                    case 1:
                        isValid = _b.sent();
                        _b.label = 2;
                    case 2:
                        token = this.strategy.token.get();
                        if (!isValid) {
                            if (!token &&
                                this.httpClient.hasHeader(this.strategy.options.token.name)) {
                                throw new expired_auth_session_error_1.ExpiredAuthSessionError();
                            }
                            return [2, config];
                        }
                        return [2, this._getUpdatedRequestConfig(config, token)];
                }
            });
        }); });
    };
    RequestController.prototype.reset = function () {
        this.httpClient.ejectRequestInterceptor(this.interceptor);
        this.interceptor = null;
    };
    RequestController.prototype._needToken = function (config) {
        var options = this.strategy.options;
        return (options.token.global ||
            Object.values(options.endpoints).some(function (endpoint) {
                return typeof endpoint === 'object'
                    ? endpoint.url === config.url
                    : endpoint === config.url;
            }));
    };
    RequestController.prototype._getUpdatedRequestConfig = function (config, token) {
        if (typeof token === 'string') {
            config.headers[this.strategy.options.token.name] = token;
        }
        return config;
    };
    return RequestController;
}());
exports.RequestController = RequestController;
