"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auth = void 0;
var tslib_1 = require("tslib");
var options_1 = require("./options");
var aggregator_storage_1 = require("./storages/aggregator-storage");
var axios_adapter_1 = require("./http/axios-adapter");
var utils_1 = require("./utils");
(0, tslib_1.__exportStar)(require("./options"), exports);
(0, tslib_1.__exportStar)(require("./types/strategy"), exports);
(0, tslib_1.__exportStar)(require("./types/storage"), exports);
(0, tslib_1.__exportStar)(require("./types/http"), exports);
(0, tslib_1.__exportStar)(require("./http/axios-adapter"), exports);
(0, tslib_1.__exportStar)(require("./http/refresh-controller"), exports);
(0, tslib_1.__exportStar)(require("./http/request-controller"), exports);
(0, tslib_1.__exportStar)(require("./tokens/token"), exports);
(0, tslib_1.__exportStar)(require("./tokens/refresh-token"), exports);
(0, tslib_1.__exportStar)(require("./tokens/token-status"), exports);
(0, tslib_1.__exportStar)(require("./storages/aggregator-storage"), exports);
(0, tslib_1.__exportStar)(require("./storages/cookie-storage"), exports);
(0, tslib_1.__exportStar)(require("./storages/local-storage"), exports);
(0, tslib_1.__exportStar)(require("./strategies/local-strategy"), exports);
(0, tslib_1.__exportStar)(require("./strategies/refresh-strategy"), exports);
var Auth = (function () {
    function Auth(authOptions) {
        var _this = this;
        this.strategies = {};
        this.state = { user: null, loggedIn: false };
        this.errorListeners = [];
        var options = (0, utils_1.merge)(authOptions, options_1.defaultOptions);
        this.httpClient = options.httpClient
            ? options.httpClient
            : new axios_adapter_1.AxiosAdapter();
        this.storage = new aggregator_storage_1.AggregatorStorage(options.storages.map(function (s) { return new s.storage(s.storageOptions); }));
        options.strategies.forEach(function (s) {
            _this.strategies[s.strategyOptions.name] = new s.strategy(_this, s.strategyOptions);
        });
        this.defaultStrategy =
            options.defaultStrategy || options.strategies.length
                ? options.strategies[0].strategyOptions.name
                : '';
    }
    Auth.prototype.init = function () {
        this.storage.sync('strategy');
        if (!this.getStrategy(false)) {
            this.storage.set('strategy', this.defaultStrategy);
            if (!this.getStrategy(false)) {
                return Promise.resolve();
            }
        }
        return this.getStrategy().init();
    };
    Auth.prototype.getStrategy = function (throwException) {
        if (throwException === void 0) { throwException = true; }
        var strategy = this.storage.get('strategy');
        if (throwException) {
            if (!strategy) {
                throw new Error('No strategy is set!');
            }
            if (!this.strategies[strategy]) {
                throw new Error('Strategy not supported: ' + strategy);
            }
        }
        return this.strategies[strategy];
    };
    Auth.prototype.setStrategy = function (name) {
        if (name === this.storage.get('strategy')) {
            return;
        }
        if (!this.strategies[name]) {
            throw new Error("Strategy ".concat(name, " is not defined!"));
        }
        this.reset();
        this.storage.set('strategy', name);
        return;
    };
    Auth.prototype.loginWith = function (name) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        this.setStrategy(name);
        return this.login.apply(this, args);
    };
    Auth.prototype.login = function () {
        var _a;
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return (_a = this.getStrategy())
            .login.apply(_a, args).catch(function (error) {
            _this.callOnError(error, { method: 'login' });
            return Promise.reject(error);
        });
    };
    Auth.prototype.fetchUser = function () {
        var _a;
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return Promise.resolve((_a = this.getStrategy()).fetchUser.apply(_a, args)).catch(function (error) {
            _this.callOnError(error, { method: 'fetchUser' });
            return Promise.reject(error);
        });
    };
    Auth.prototype.logout = function () {
        var _a;
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return Promise.resolve((_a = this.getStrategy()).logout.apply(_a, args)).catch(function (error) {
            _this.callOnError(error, { method: 'logout' });
            return Promise.reject(error);
        });
    };
    Auth.prototype.reset = function () {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return (_a = this.getStrategy()).reset.apply(_a, args);
    };
    Auth.prototype.check = function () {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return (_a = this.getStrategy()).check.apply(_a, args);
    };
    Auth.prototype.fetchUserOnce = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!this.state.user) {
            return this.fetchUser.apply(this, args);
        }
        return Promise.resolve();
    };
    Auth.prototype.setUser = function (user) {
        this.setState({ user: user });
        var check = { valid: Boolean(user) };
        if (check.valid) {
            check = this.check();
        }
        this.setState({ loggedIn: check.valid });
    };
    Auth.prototype.onError = function (listener) {
        this.errorListeners.push(listener);
    };
    Auth.prototype.callOnError = function (error, payload) {
        if (payload === void 0) { payload = {}; }
        for (var _i = 0, _a = this.errorListeners; _i < _a.length; _i++) {
            var fn = _a[_i];
            fn(error, payload);
        }
    };
    Auth.prototype.setState = function (state) {
        Object.assign(this.state, state);
    };
    return Auth;
}());
exports.Auth = Auth;
