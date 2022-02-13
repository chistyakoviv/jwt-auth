import * as utils from './index';

describe('utils', () => {
    // Checking isUnset

    it('Checks if undefined value is considered to be unset', () => {
        const result = utils.isUnset(undefined);

        expect(result).toBe(true);
    });

    it('Checks if null value is considered to be unset', () => {
        const result = utils.isUnset(null);

        expect(result).toBe(true);
    });

    it('Checks if string value is considered to be set', () => {
        const result = utils.isUnset('test');

        expect(result).toBe(false);
    });

    it('Checks if number value is considered to be set', () => {
        const result = utils.isUnset(42);

        expect(result).toBe(false);
    });

    it('Checks if object value is considered to be set', () => {
        const result = utils.isUnset({});

        expect(result).toBe(false);
    });

    it('Checks if boolean false value is considered to be set', () => {
        const result = utils.isUnset(false);

        expect(result).toBe(false);
    });

    it('Checks if boolean true value is considered to be set', () => {
        const result = utils.isUnset(true);

        expect(result).toBe(false);
    });

    it('Checks if symbol value is considered to be set', () => {
        const result = utils.isUnset(Symbol('id'));

        expect(result).toBe(false);
    });

    // Checking isSet

    it('Checks if undefined value is considered to be unset', () => {
        const result = utils.isSet(undefined);

        expect(result).toBe(false);
    });

    it('Checks if null value is considered to be unset', () => {
        const result = utils.isSet(null);

        expect(result).toBe(false);
    });

    it('Checks if string value is considered to be set', () => {
        const result = utils.isSet('test');

        expect(result).toBe(true);
    });

    it('Checks if number value is considered to be set', () => {
        const result = utils.isSet(42);

        expect(result).toBe(true);
    });

    it('Checks if object value is considered to be set', () => {
        const result = utils.isSet({});

        expect(result).toBe(true);
    });

    it('Checks if boolean false value is considered to be set', () => {
        const result = utils.isSet(false);

        expect(result).toBe(true);
    });

    it('Checks if boolean true value is considered to be set', () => {
        const result = utils.isSet(true);

        expect(result).toBe(true);
    });

    it('Checks if symbol value is considered to be set', () => {
        const result = utils.isSet(Symbol('id'));

        expect(result).toBe(true);
    });

    // Checking endcodeValue

    it('Does not encodes string value', () => {
        const result = utils.encodeValue('test');

        expect(result).toBe('test');
    });

    it('Encodes object value', () => {
        const result = utils.encodeValue({
            testNumber: 42,
            testBool: true,
            testNull: null,
            testUndefined: undefined,
            testString: 'test',
            testArray: [42, null, 'test', undefined],
        });

        expect(result).toBe(
            '{"testNumber":42,"testBool":true,"testNull":null,"testString":"test","testArray":[42,null,"test",null]}',
        );
    });

    it('Encodes array value', () => {
        const result = utils.encodeValue([42, null, 'test', undefined]);

        expect(result).toBe('[42,null,"test",null]');
    });

    it('Encodes boolean value', () => {
        const result = utils.encodeValue(true);

        expect(result).toBe('true');
    });

    it('Encodes number value', () => {
        const result = utils.encodeValue(42);

        expect(result).toBe('42');
    });

    // Checking decodeValue

    it('Does not decode boolean value', () => {
        const result = utils.decodeValue(true);

        expect(result).toBe(true);
    });

    it('Does not decode number value', () => {
        const result = utils.decodeValue(42);

        expect(result).toBe(42);
    });

    it('Decodes object value', () => {
        const result = utils.decodeValue(
            '{"testNumber":42,"testBool":true,"testNull":null,"testString":"test","testArray": [42,null,"test"]}',
        );

        expect(result).toStrictEqual({
            testNumber: 42,
            testBool: true,
            testNull: null,
            testString: 'test',
            testArray: [42, null, 'test'],
        });
    });

    // Checking getProp

    it('Returns false if propName is falsy', () => {
        const result = utils.getProp({ test: 42 }, false);

        expect(result).toStrictEqual({ test: 42 });
    });

    it('Returns false if holder is not an object', () => {
        const result = utils.getProp(['test'], 'test');

        expect(result).toBe(false);
    });

    it('Returns false if holder does not contain the property', () => {
        const result = utils.getProp({ test: 42 }, '42');

        expect(result).toBe(false);
    });

    it('Returns proprty value', () => {
        const result = utils.getProp({ test: 42 }, 'test');

        expect(result).toBe(42);
    });

    // Checking addTokenPrefix

    it('Returns token if token is false', () => {
        const result = utils.addTokenPrefix(false, 'test');

        expect(result).toBe(false);
    });

    it('Returns token if token type is false', () => {
        const result = utils.addTokenPrefix('token', false);

        expect(result).toBe('token');
    });

    it('Returns token if token starts with token type', () => {
        const result = utils.addTokenPrefix('tokenType token', 'tokenType');

        expect(result).toBe('tokenType token');
    });

    it('Returns prefixed token', () => {
        const result = utils.addTokenPrefix('token', 'tokenType');

        expect(result).toBe('tokenType token');
    });

    // Checking removeTokenPrefix

    it('Returns token if token is false', () => {
        const result = utils.removeTokenPrefix(false, 'test');

        expect(result).toBe(false);
    });

    it('Returns token if token type is false', () => {
        const result = utils.removeTokenPrefix('token', false);

        expect(result).toBe('token');
    });

    it('Removes token prefix', () => {
        const result = utils.removeTokenPrefix('tokenType token', 'tokenType');

        expect(result).toBe('token');
    });

    // Checking cleanObj

    it('Does not change object if it does not contain undefined values', () => {
        const result = utils.cleanObj({
            testNumber: 42,
            testBool: true,
            testNull: null,
            testArray: [undefined],
        });

        expect(result).toStrictEqual({
            testNumber: 42,
            testBool: true,
            testNull: null,
            testArray: [undefined],
        });
    });

    it('Removes properties with undefined values', () => {
        const result = utils.cleanObj({
            testUndefinedOne: undefined,
            testNumber: 42,
            testBool: true,
            testNull: null,
            testArray: [undefined],
            testUndefinedTwo: undefined,
        });

        expect(result).toStrictEqual({
            testNumber: 42,
            testBool: true,
            testNull: null,
            testArray: [undefined],
        });
    });

    // Checking deepCopy

    it('Preforms deep copy', () => {
        const orig = {
            testNumber: 42,
            testBool: true,
            testNull: null,
            testArray: ['test', 42, null],
            level2: {
                testNumber: 42,
                testBool: true,
                testNull: null,
                testArray: ['test', 42, null],
                level3: {
                    testNumber: 42,
                    testBool: true,
                    testNull: null,
                    testArray: ['test', 42, null],
                },
            },
        };

        const copy = utils.deepCopy(orig);

        expect(copy).toStrictEqual(orig);
        expect(copy).not.toBe(orig);
    });

    // Checking isObject

    it('Returns false if value is null', () => {
        const result = utils.isObject(null);

        expect(result).toBe(false);
    });

    it('Returns false if value is string', () => {
        const result = utils.isObject('test');

        expect(result).toBe(false);
    });

    it('Returns false if value is number', () => {
        const result = utils.isObject(42);

        expect(result).toBe(false);
    });

    it('Returns false if value is function', () => {
        const result = utils.isObject(() => ({}));

        expect(result).toBe(false);
    });

    it('Returns true if value is object', () => {
        const result = utils.isObject({});

        expect(result).toBe(true);
    });

    // Checking merge

    it('Merges two objects recursively', () => {
        const base = {
            testReplaceNumber: 0,
            testUntouchedNumber: 42,
            testReplaceBool: false,
            testUntouchedBool: true,
            testNull: null,
            testReplaceString: '',
            testUntouchedString: 'test',
            testArray: [0, null, 'test', undefined],
            testUntouchedArray: [42, null, 'test', undefined],
            level2: {
                testReplaceNumber: 0,
                testUntouchedNumber: 42,
                testReplaceBool: false,
                testUntouchedBool: true,
                testNull: null,
                testReplaceString: '',
                testUntouchedString: 'test',
                testArray: [0, null, 'test', undefined],
                testUntouchedArray: [42, null, 'test', undefined],
            },
        };
        const defaults = {
            testReplaceNumber: 42,
            testBool: true,
            testReplaceBool: true,
            testNull: null,
            testReplaceString: 'test',
            testArray: [42, null, 'test', undefined],
            level2: {
                testReplaceNumber: 42,
                testBool: true,
                testReplaceBool: true,
                testNull: null,
                testReplaceString: 'test',
                testArray: [42, null, 'test', undefined],
            },
        };

        const result = utils.merge(base, defaults);

        expect(result).toStrictEqual({
            testReplaceNumber: 0,
            testBool: true,
            testNull: null,
            testReplaceString: '',
            testArray: [
                42,
                null,
                'test',
                undefined,
                0,
                null,
                'test',
                undefined,
            ],
            level2: {
                testReplaceNumber: 0,
                testBool: true,
                testNull: null,
                testReplaceString: '',
                testArray: [
                    42,
                    null,
                    'test',
                    undefined,
                    0,
                    null,
                    'test',
                    undefined,
                ],
                testUntouchedNumber: 42,
                testReplaceBool: false,
                testUntouchedBool: true,
                testUntouchedString: 'test',
                testUntouchedArray: [42, null, 'test', undefined],
            },
            testUntouchedNumber: 42,
            testReplaceBool: false,
            testUntouchedBool: true,
            testUntouchedString: 'test',
            testUntouchedArray: [42, null, 'test', undefined],
        });
    });
});
