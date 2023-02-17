"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenStatus = exports.TokenStatusEnum = void 0;
var TokenStatusEnum;
(function (TokenStatusEnum) {
    TokenStatusEnum["UNKNOWN"] = "UNKNOWN";
    TokenStatusEnum["VALID"] = "VALID";
    TokenStatusEnum["EXPIRED"] = "EXPIRED";
})(TokenStatusEnum = exports.TokenStatusEnum || (exports.TokenStatusEnum = {}));
var TokenStatus = (function () {
    function TokenStatus(tokenExpiresAt) {
        this._status = this._calculate(tokenExpiresAt);
    }
    TokenStatus.prototype.unknown = function () {
        return TokenStatusEnum.UNKNOWN === this._status;
    };
    TokenStatus.prototype.valid = function () {
        return TokenStatusEnum.VALID === this._status;
    };
    TokenStatus.prototype.expired = function () {
        return TokenStatusEnum.EXPIRED === this._status;
    };
    TokenStatus.prototype._calculate = function (tokenExpiresAt) {
        var now = Date.now();
        if (!tokenExpiresAt) {
            return TokenStatusEnum.UNKNOWN;
        }
        var timeSlackMillis = 500;
        tokenExpiresAt -= timeSlackMillis;
        if (now < tokenExpiresAt) {
            return TokenStatusEnum.VALID;
        }
        return TokenStatusEnum.EXPIRED;
    };
    return TokenStatus;
}());
exports.TokenStatus = TokenStatus;
