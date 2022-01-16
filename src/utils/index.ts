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
