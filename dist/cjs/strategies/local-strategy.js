"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStrategy = exports.DEFAULTS = void 0;
var tslib_1 = require("tslib");
var request_controller_1 = require("../http/request-controller");
var token_1 = require("../tokens/token");
var utils_1 = require("../utils");
exports.DEFAULTS = {
    name: 'local',
    endpoints: {
        login: {
            url: '/api/auth/login',
            method: 'post',
        },
        logout: {
            url: '/api/auth/logout',
            method: 'post',
        },
        user: {
            url: '/api/auth/user',
            method: 'get',
        },
    },
    token: {
        property: 'token',
        type: 'Bearer',
        name: 'Authorization',
        maxAge: 1800,
        global: true,
        required: true,
        prefix: '_token.',
        expirationPrefix: '_token_expiration.',
    },
    user: {
        property: 'user',
        autoFetch: true,
    },
    clientId: false,
    grantType: false,
    scope: false,
};
var LocalStrategy = (function () {
    function LocalStrategy(auth, options) {
        this.auth = auth;
        this.options = (0, utils_1.merge)(options, exports.DEFAULTS);
        this.token = new token_1.Token(this, this.auth.storage);
        this.requestController = new request_controller_1.RequestController(this);
    }
    LocalStrategy.prototype.init = function () {
        this.initializeRequestInterceptor();
        return this.auth.fetchUserOnce();
    };
    LocalStrategy.prototype.check = function (checkStatus) {
        if (checkStatus === void 0) { checkStatus = false; }
        var response = {
            valid: false,
            tokenExpired: false,
        };
        var token = this.token.sync();
        if (!token) {
            return response;
        }
        if (!checkStatus) {
            response.valid = true;
            return response;
        }
        var tokenStatus = this.token.status();
        if (tokenStatus.expired()) {
            response.tokenExpired = true;
            return response;
        }
        response.valid = true;
        return response;
    };
    LocalStrategy.prototype.login = function (endpoint, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.reset, reset = _c === void 0 ? true : _c;
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function () {
            var reqeustData, response;
            return (0, tslib_1.__generator)(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!this.options.endpoints.login) {
                            return [2];
                        }
                        if (reset) {
                            this.auth.reset({ resetInterceptor: false });
                        }
                        if (this.options.clientId) {
                            endpoint.data.client_id = this.options.clientId;
                        }
                        if (this.options.grantType) {
                            endpoint.data.grant_type = this.options.grantType;
                        }
                        if (this.options.scope) {
                            endpoint.data.scope = this.options.scope;
                        }
                        reqeustData = (0, tslib_1.__assign)((0, tslib_1.__assign)({}, this.options.endpoints.login), endpoint);
                        return [4, this.auth.httpClient.request(reqeustData)];
                    case 1:
                        response = _d.sent();
                        this.updateTokens(response);
                        if (!this.options.user.autoFetch) return [3, 3];
                        return [4, this.fetchUser()];
                    case 2:
                        _d.sent();
                        _d.label = 3;
                    case 3: return [2, response];
                }
            });
        });
    };
    LocalStrategy.prototype.setUserToken = function (token) {
        this.token.set(token);
        return this.fetchUser();
    };
    LocalStrategy.prototype.fetchUser = function (endpoint) {
        var _this = this;
        if (!this.check().valid) {
            return Promise.resolve();
        }
        if (!this.options.endpoints.user) {
            this.auth.setUser({});
            return Promise.resolve();
        }
        var reqeustData = (0, tslib_1.__assign)((0, tslib_1.__assign)({}, this.options.endpoints.user), endpoint);
        return this.auth.httpClient
            .request(reqeustData)
            .then(function (response) {
            var userData = (0, utils_1.getProp)(response.data, _this.options.user.property);
            if (!userData) {
                var error = new Error("User Data response does not contain field ".concat(_this.options.user.property));
                return Promise.reject(error);
            }
            _this.auth.setUser(userData);
            return response;
        })
            .catch(function (error) {
            _this.auth.callOnError(error, { method: 'fetchUser' });
            return Promise.reject(error);
        });
    };
    LocalStrategy.prototype.logout = function (endpoint) {
        if (endpoint === void 0) { endpoint = {}; }
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function () {
            var reqeustData;
            return (0, tslib_1.__generator)(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        reqeustData = (0, tslib_1.__assign)((0, tslib_1.__assign)({}, this.options.endpoints.logout), endpoint);
                        if (!this.options.endpoints.logout) return [3, 2];
                        return [4, this.auth.httpClient.request(reqeustData)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2, this.auth.reset()];
                }
            });
        });
    };
    LocalStrategy.prototype.reset = function (_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.resetInterceptor, resetInterceptor = _c === void 0 ? true : _c;
        this.auth.setUser(false);
        this.token.reset();
        if (resetInterceptor) {
            this.requestController.reset();
        }
    };
    LocalStrategy.prototype.updateTokens = function (response) {
        var token = this.options.token.required
            ? (0, utils_1.getProp)(response.data, this.options.token.property)
            : true;
        this.token.set(token);
    };
    LocalStrategy.prototype.initializeRequestInterceptor = function () {
        this.requestController.initializeRequestInterceptor();
    };
    return LocalStrategy;
}());
exports.LocalStrategy = LocalStrategy;
