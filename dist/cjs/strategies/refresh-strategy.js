"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshStrategy = exports.REFRESH_STRATEGY_DEFAULTS = void 0;
var tslib_1 = require("tslib");
var utils_1 = require("../utils");
var refresh_controller_1 = require("../http/refresh-controller");
var refresh_token_1 = require("../tokens/refresh-token");
var expired_auth_session_error_1 = require("../errors/expired-auth-session-error");
var local_strategy_1 = require("./local-strategy");
exports.REFRESH_STRATEGY_DEFAULTS = {
    name: 'refresh',
    endpoints: {
        refresh: {
            url: '/api/auth/refresh',
            method: 'post',
        },
    },
    refreshToken: {
        property: 'refresh_token',
        data: 'refresh_token',
        maxAge: 60 * 60 * 24 * 30,
        required: true,
        tokenRequired: false,
        prefix: '_refresh_token.',
        expirationPrefix: '_refresh_token_expiration.',
    },
    autoLogout: false,
};
var RefreshStrategy = (function (_super) {
    (0, tslib_1.__extends)(RefreshStrategy, _super);
    function RefreshStrategy(auth, options) {
        var _this = _super.call(this, auth, (0, utils_1.merge)(options, exports.REFRESH_STRATEGY_DEFAULTS)) || this;
        _this.auth = auth;
        _this.refreshToken = new refresh_token_1.RefreshToken(_this, _this.auth.storage);
        _this.refreshController = new refresh_controller_1.RefreshController(_this);
        return _this;
    }
    RefreshStrategy.prototype.check = function (checkStatus) {
        if (checkStatus === void 0) { checkStatus = false; }
        var response = {
            valid: false,
            tokenExpired: false,
            refreshTokenExpired: false,
            isRefreshable: true,
        };
        var token = this.token.sync();
        var refreshToken = this.refreshToken.sync();
        if (!token || !refreshToken) {
            return response;
        }
        if (!checkStatus) {
            response.valid = true;
            return response;
        }
        var tokenStatus = this.token.status();
        var refreshTokenStatus = this.refreshToken.status();
        if (refreshTokenStatus.expired()) {
            response.refreshTokenExpired = true;
            return response;
        }
        if (tokenStatus.expired()) {
            response.tokenExpired = true;
            return response;
        }
        response.valid = true;
        return response;
    };
    RefreshStrategy.prototype.refreshTokens = function () {
        var _this = this;
        if (!this.options.endpoints.refresh) {
            return Promise.resolve();
        }
        if (!this.check().valid) {
            return Promise.resolve();
        }
        var refreshTokenStatus = this.refreshToken.status();
        if (refreshTokenStatus.expired()) {
            this.auth.reset();
            throw new expired_auth_session_error_1.ExpiredAuthSessionError();
        }
        if (!this.options.refreshToken.tokenRequired) {
            this.requestController.clearHeader();
        }
        var endpoint = {
            data: {
                client_id: undefined,
                grant_type: undefined,
            },
        };
        if (this.options.refreshToken.required &&
            this.options.refreshToken.data) {
            endpoint.data[this.options.refreshToken.data] =
                this.refreshToken.get();
        }
        if (this.options.clientId) {
            endpoint.data.client_id = this.options.clientId;
        }
        if (this.options.grantType) {
            endpoint.data.grant_type = 'refresh_token';
        }
        (0, utils_1.cleanObj)(endpoint.data);
        var reqeustData = (0, tslib_1.__assign)((0, tslib_1.__assign)({}, this.options.endpoints.refresh), endpoint);
        return this.auth.httpClient
            .request(reqeustData)
            .then(function (response) {
            _this.updateTokens(response, { isRefreshing: true });
            return response;
        })
            .catch(function (error) {
            _this.auth.callOnError(error, { method: 'refreshToken' });
            return Promise.reject(error);
        });
    };
    RefreshStrategy.prototype.setUserToken = function (token, refreshToken) {
        this.token.set(token);
        if (refreshToken) {
            this.refreshToken.set(refreshToken);
        }
        return this.fetchUser();
    };
    RefreshStrategy.prototype.reset = function (_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.resetInterceptor, resetInterceptor = _c === void 0 ? true : _c;
        this.auth.setUser(false);
        this.token.reset();
        this.refreshToken.reset();
        if (resetInterceptor) {
            this.requestController.reset();
        }
    };
    RefreshStrategy.prototype.updateTokens = function (response, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.isRefreshing, isRefreshing = _c === void 0 ? false : _c, _d = _b.updateOnRefresh, updateOnRefresh = _d === void 0 ? true : _d;
        var token = this.options.token.required
            ? (0, utils_1.getProp)(response.data, this.options.token.property)
            : true;
        var refreshToken = this.options.refreshToken.required
            ? (0, utils_1.getProp)(response.data, this.options.refreshToken.property)
            : true;
        this.token.set(token);
        if (refreshToken &&
            (!isRefreshing || (isRefreshing && updateOnRefresh))) {
            this.refreshToken.set(refreshToken);
        }
    };
    RefreshStrategy.prototype.initializeRequestInterceptor = function () {
        this.requestController.initializeRequestInterceptor(this.options.endpoints.refresh.url);
    };
    return RefreshStrategy;
}(local_strategy_1.LocalStrategy));
exports.RefreshStrategy = RefreshStrategy;
