"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpiredAuthSessionError = void 0;
var tslib_1 = require("tslib");
var ExpiredAuthSessionError = (function (_super) {
    (0, tslib_1.__extends)(ExpiredAuthSessionError, _super);
    function ExpiredAuthSessionError() {
        var _this = _super.call(this, 'Both token and refresh token have expired. Your request was aborted.') || this;
        _this.name = 'ExpiredAuthSessionError';
        return _this;
    }
    return ExpiredAuthSessionError;
}(Error));
exports.ExpiredAuthSessionError = ExpiredAuthSessionError;
