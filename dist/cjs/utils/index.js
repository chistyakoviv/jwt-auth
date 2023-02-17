"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.merge = exports.isObject = exports.deepCopy = exports.cleanObj = exports.removeTokenPrefix = exports.addTokenPrefix = exports.getProp = exports.decodeValue = exports.encodeValue = exports.isSet = exports.isUnset = void 0;
var isUnset = function (value) {
    return typeof value === 'undefined' || value === null;
};
exports.isUnset = isUnset;
var isSet = function (value) { return !(0, exports.isUnset)(value); };
exports.isSet = isSet;
function encodeValue(val) {
    if (typeof val === 'string') {
        return val;
    }
    return JSON.stringify(val);
}
exports.encodeValue = encodeValue;
function decodeValue(val) {
    if (typeof val === 'string') {
        try {
            return JSON.parse(val);
        }
        catch (_) { }
    }
    return val;
}
exports.decodeValue = decodeValue;
function getProp(holder, propName) {
    if (!propName || !holder || typeof holder !== 'object') {
        return holder;
    }
    if (propName in holder) {
        return holder[propName];
    }
    return false;
}
exports.getProp = getProp;
function addTokenPrefix(token, tokenType) {
    if (!token ||
        !tokenType ||
        typeof token !== 'string' ||
        token.startsWith(tokenType)) {
        return token;
    }
    return "".concat(tokenType, " ").concat(token);
}
exports.addTokenPrefix = addTokenPrefix;
function removeTokenPrefix(token, tokenType) {
    if (!token || !tokenType || typeof token !== 'string') {
        return token;
    }
    return token.replace("".concat(tokenType, " "), '');
}
exports.removeTokenPrefix = removeTokenPrefix;
function cleanObj(obj) {
    for (var key in obj) {
        if (obj[key] === undefined) {
            delete obj[key];
        }
    }
    return obj;
}
exports.cleanObj = cleanObj;
function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}
exports.deepCopy = deepCopy;
function isObject(val) {
    return val !== null && typeof val === 'object';
}
exports.isObject = isObject;
function merge(base, defaults) {
    var result = Object.assign({}, defaults);
    for (var key in base) {
        var val = base[key];
        if (Array.isArray(val) && Array.isArray(result[key])) {
            result[key] = result[key].concat(val);
        }
        else if (isObject(val) && isObject(result[key])) {
            result[key] = merge(val, result[key]);
        }
        else {
            result[key] = val;
        }
    }
    return result;
}
exports.merge = merge;
