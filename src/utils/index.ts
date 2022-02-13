export const isUnset = (value: any): boolean =>
    typeof value === 'undefined' || value === null;

export const isSet = (value: any): boolean => !isUnset(value);

export function encodeValue(val: any): string {
    if (typeof val === 'string') {
        return val;
    }

    return JSON.stringify(val);
}

export function decodeValue(val: any): any {
    if (typeof val === 'string') {
        try {
            return JSON.parse(val);
        } catch (_) {}
    }

    return val;
}

export function getProp(
    holder: Record<string, any>,
    propName: string | false,
): any {
    if (!propName || !holder || typeof holder !== 'object') {
        return holder;
    }

    if (propName in holder) {
        return holder[propName];
    }

    return false;
}

export function addTokenPrefix(
    token: string | boolean,
    tokenType: string | false,
): string | boolean {
    if (
        !token ||
        !tokenType ||
        typeof token !== 'string' ||
        token.startsWith(tokenType)
    ) {
        return token;
    }

    return `${tokenType} ${token}`;
}

export function removeTokenPrefix(
    token: string | boolean,
    tokenType: string | false,
): string | boolean {
    if (!token || !tokenType || typeof token !== 'string') {
        return token;
    }

    return token.replace(`${tokenType} `, '');
}

export function cleanObj(obj: Record<string, any>): Record<string, any> {
    for (const key in obj) {
        if (obj[key] === undefined) {
            delete obj[key];
        }
    }

    return obj;
}

export function deepCopy(obj: Record<string, any>): Record<string, any> {
    return JSON.parse(JSON.stringify(obj));
}

export function isObject(val: any) {
    return val !== null && typeof val === 'object';
}

export function merge(base: any, defaults: any) {
    const result = Object.assign({}, defaults);

    for (const key in base) {
        const val = base[key];

        if (Array.isArray(val) && Array.isArray(result[key])) {
            result[key] = result[key].concat(val);
        } else if (isObject(val) && isObject(result[key])) {
            result[key] = merge(val, result[key]);
        } else {
            result[key] = val;
        }
    }

    return result;
}
