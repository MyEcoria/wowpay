import { describe, expect, test } from '@jest/globals';
import { Converter } from '../modules/unit-converter.mjs';

describe('Unit Converter Tests', () => {
    describe('Raw to Mega Conversion Tests', () => {
        test('rawToMega should convert RAW to Mega correctly for XNO', () => {
            const converter = new Converter('XNO');
            expect(converter.rawToMega("1000000000000000000000000000000")).toBe("1");
        });

        test('rawToMega should convert RAW to Mega correctly for ANA', () => {
            const converter = new Converter('ANA');
            expect(converter.rawToMega("10000000000000000000000000000")).toBe("1");
        });

        test('rawToMega should throw error for undefined raw amount', () => {
            const converter = new Converter('XNO');
            expect(() => converter.rawToMega(undefined)).toThrow('The raw amount must be defined.');
        });

        test('rawToMega should throw error for invalid raw amount', () => {
            const converter = new Converter('XNO');
            expect(() => converter.rawToMega("invalid")).toThrow('The raw amount is invalid.');
        });

        test('rawToMega should throw error for negative raw amount', () => {
            const converter = new Converter('XNO');
            expect(() => converter.rawToMega("-1")).toThrow('The raw amount must not be negative.');
        });

        test('rawToMega should throw error for raw amount too small', () => {
            const converter = new Converter('XNO');
            expect(() => converter.rawToMega("0.5")).toThrow('The raw amount is too small.');
        });

        test('rawToMega should throw error for raw amount too large', () => {
            const converter = new Converter('XNO');
            expect(() => converter.rawToMega("340282366920938463463374607431768211456")).toThrow('The raw amount is too large.');
        });
    });

    describe('Mega to Raw Conversion Tests', () => {
        test('megaToRaw should convert Mega to RAW correctly for XNO', () => {
            const converter = new Converter('XNO');
            expect(converter.megaToRaw("1")).toBe("1000000000000000000000000000000");
        });

        test('megaToRaw should convert Mega to RAW correctly for ANA', () => {
            const converter = new Converter('ANA');
            expect(converter.megaToRaw("1")).toBe("10000000000000000000000000000");
        });

        test('megaToRaw should throw error for undefined mega amount', () => {
            const converter = new Converter('XNO');
            expect(() => converter.megaToRaw(undefined)).toThrow('The mega amount must be defined.');
        });

        test('megaToRaw should throw error for invalid mega amount', () => {
            const converter = new Converter('XNO');
            expect(() => converter.megaToRaw("invalid")).toThrow('The mega amount is invalid.');
        });

        test('megaToRaw should throw error for negative mega amount', () => {
            const converter = new Converter('XNO');
            expect(() => converter.megaToRaw("-1")).toThrow('The mega amount must not be negative.');
        });

        test('megaToRaw should throw error for mega amount too small', () => {
            const converter = new Converter('XNO');
            expect(() => converter.megaToRaw("0.0000000000000000000000000000001")).toThrow('The mega amount is too small.');
        });

        test('megaToRaw should throw error for mega amount too large', () => {
            const converter = new Converter('XNO');
            expect(() => converter.megaToRaw("340282366920938463463374607431768211456")).toThrow('The mega amount is too large.');
        });
    });
});
describe('Additional Raw to Mega Conversion Tests', () => {
    test('rawToMega should return 0 for raw amount of 0', () => {
        const converter = new Converter('XNO');
        expect(converter.rawToMega("0")).toBe(0);
    });

    test('rawToMega should throw error for negative raw amount', () => {
        const converter = new Converter('XNO');
        expect(() => converter.rawToMega("-1000000000000000000000000000000")).toThrow('The raw amount must not be negative.');
    });
});

describe('Additional Mega to Raw Conversion Tests', () => {
    test('megaToRaw should throw error for mega amount of 0', () => {
        const converter = new Converter('XNO');
        expect(() => converter.megaToRaw("0")).toThrow('The mega amount is too small.');
    });

    test('megaToRaw should throw error for negative mega amount', () => {
        const converter = new Converter('XNO');
        expect(() => converter.megaToRaw("-1")).toThrow('The mega amount must not be negative.');
    });
});

describe('Chain Implementation Tests', () => {
    test('should throw error for unimplemented chain', () => {
        expect(() => new Converter('INVALID_CHAIN')).toThrow('INVALID_CHAIN rawToMega unit convert is not implemented');
    });
});

describe('Unit Configuration Tests', () => {
    test('should throw error when mega_in_raw is undefined', () => {
        expect(() => new Converter('INVALID_CHAIN')).toThrow('INVALID_CHAIN rawToMega unit convert is not implemented');
    });
});

describe('Type Validation Tests', () => {
    test('rawToMega should throw error for boolean input', () => {
        const converter = new Converter('XNO');
        expect(() => converter.rawToMega(true)).toThrow('The raw amount must be a string or a number.');
    });

    test('rawToMega should accept numeric string input', () => {
        const converter = new Converter('XNO');
        expect(converter.rawToMega("1000000000000000000000000000000")).toBe("1");
    });

    test('rawToMega should accept number input', () => {
        const converter = new Converter('XNO');
        expect(converter.rawToMega(1000000000000000000000000000000)).toBe("1");
    });
});

describe('Mega Amount Type Validation Tests', () => {
    test('megaToRaw should throw error for boolean input', () => {
        const converter = new Converter('XNO');
        expect(() => converter.megaToRaw(true)).toThrow('The mega amount must be a string or a number.');
    });

    test('megaToRaw should throw error for object input', () => {
        const converter = new Converter('XNO');
        expect(() => converter.megaToRaw({})).toThrow('The mega amount must be a string or a number.');
    });

    test('megaToRaw should throw error for array input', () => {
        const converter = new Converter('XNO');
        expect(() => converter.megaToRaw([])).toThrow('The mega amount must be a string or a number.');
    });

    test('megaToRaw should accept numeric string input', () => {
        const converter = new Converter('XNO');
        expect(converter.megaToRaw("1")).toBe("1000000000000000000000000000000");
    });

    test('megaToRaw should accept number input', () => {
        const converter = new Converter('XNO');
        expect(converter.megaToRaw(1)).toBe("1000000000000000000000000000000");
    });
});

describe('Unit Configuration Tests', () => {
    test('should throw error when mega_in_raw is undefined', () => {
        expect(() => new Converter('UNDEFINED')).toThrow('UNDEFINED rawToMega unit convert is not implemented');
    });
});

describe('Additional Chain Implementation Tests for megaToRaw', () => {
    test('megaToRaw should throw error when chain is not in UNIT_TICKER', () => {
        const converter = new Converter('XNO');
        // Temporarily modify chain to test error
        converter.chain = 'INVALID_CHAIN';
        expect(() => converter.megaToRaw("1")).toThrow('INVALID_CHAIN megaToRaw unit convert is not implemented');
    });

    test('megaToRaw should throw error when raw_in_mega is undefined', () => {
        const converter = new Converter('XNO');
        // Temporarily modify chain to test error
        converter.chain = 'UNDEFINED';
        expect(() => converter.megaToRaw("1")).toThrow('UNDEFINED megaToRaw unit convert is not implemented');
    });

    test('megaToRaw should work correctly for all supported chains', () => {
        const supportedChains = ['XNO', 'XRO', 'ANA', 'PAW', 'BAN', 'XDG'];
        supportedChains.forEach(chain => {
            const converter = new Converter(chain);
            expect(() => converter.megaToRaw("1")).not.toThrow();
        });
    });
});
