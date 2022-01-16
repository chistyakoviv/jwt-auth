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
    // Try to parse as json
    if (typeof val === 'string') {
        try {
            return JSON.parse(val);
        } catch (_) {}
    }

    // Return as is
    return val;
}
