import { describe, expect, test } from '@jest/globals';
import {
    isValidURL,
    isValidAddress,
    isValidWowneroAddress,
    isValidAmount,
    wowToMega,
    MegaToWow,
    isValidUsername,
    isValidPassword,
    isValidUUID,
    isInteger,
    estNombre,
    RawToMega,
    MegaToRaw,
    sleep,
    calculateMultiplier,
    pourcentage,
    dateToTimestamp,
    addMinutesAndCompare,
    theWork,
    workLocal
} from '../modules/utils.mjs';

describe('URL Validation Tests', () => {
    test('isValidURL should accept valid HTTPS URLs', () => {
        expect(isValidURL("https://google.com")).toBe(true);
        expect(isValidURL("https://sub.domain.com")).toBe(true);
        expect(isValidURL("https://domain-with-dash.com")).toBe(true);
    });

    test('isValidURL should accept valid HTTP URLs', () => {
        expect(isValidURL("http://example.com")).toBe(true);
        expect(isValidURL("http://123.45.67.89")).toBe(true);
        expect(isValidURL("http://localhost:8080")).toBe(true);
    });

    test('isValidURL should accept URLs with special characters', () => {
        expect(isValidURL("https://example.com/path~!@#$%^&*()_+-={}[]|;:,./")).toBe(true);
        expect(isValidURL("https://example.com/path?q=test&param=value!@#$")).toBe(true);
        expect(isValidURL("https://example.com/path#fragment%20with%20space")).toBe(true);
    });

    test('isValidURL should reject invalid URLs', () => {
        expect(isValidURL("not-a-url")).toBe(false);
        expect(isValidURL("ftp://invalid-protocol.com")).toBe(false);
        expect(isValidURL("https://")).toBe(false);
        expect(isValidURL("://example.com")).toBe(false);
        expect(isValidURL("javascript:alert(1)")).toBe(false);
    });

    test('isValidURL should handle URLs with paths and parameters', () => {
        expect(isValidURL("https://example.com/path?param=value")).toBe(true);
        expect(isValidURL("https://example.com/path/to/resource?a=1&b=2")).toBe(true);
        expect(isValidURL("https://example.com/path?param=value#fragment")).toBe(true);
        expect(isValidURL("https://example.com/path?p=123&q=test+string")).toBe(true);
    });
});

describe('Address Validation Tests', () => {
    test('isValidAddress should accept valid Nano addresses', () => {
        expect(isValidAddress("nano_37391u1nrr1j7tdn8w9zathoio5suz9bar18jksqheeiy4obwz3pkgp9aqz6")).toBe(true);
    });

    test('isValidAddress should accept valid Banano addresses', () => {
        expect(isValidAddress("ban_1wu1yjxsxu5yicyutw9149pno7djmbmrrs6kbfnbro4x3weu8rgnk83miqzx")).toBe(true);
    });

    test('isValidAddress should accept valid Ananos addresses', () => {
        expect(isValidAddress("ana_1wu1yjxsxu5yicyutw9149pno7djmbmrrs6kbfnbro4x3weu8rgnk83miqzx")).toBe(true);
    });

    test('isValidAddress should accept valid DogeNano addresses', () => {
        expect(isValidAddress("xdg_1wu1yjxsxu5yicyutw9149pno7djmbmrrs6kbfnbro4x3weu8rgnk83miqzx")).toBe(true);
    });

    test('isValidAddress should accept valid RaiblocksOne addresses', () => {
        expect(isValidAddress("xro_1wu1yjxsxu5yicyutw9149pno7djmbmrrs6kbfnbro4x3weu8rgnk83miqzx")).toBe(true);
    });

    test('isValidAddress should reject invalid addresses', () => {
        expect(isValidAddress("invalid_address")).toBe(false);
    });

    test('isValidWowneroAddress should accept valid Wownero addresses', () => {
        expect(isValidWowneroAddress("WW3K4ebLPGtFxaNyur6jkQdsC2khrUQ9BME9cmHgaJGxAzjtwYk3JfwRFuZ5U15KEvbU1VeFUa4JmWKHZmMX2vV41uxvTQuCX")).toBe(true);
    });

    test('isValidWowneroAddress should reject invalid Wownero addresses', () => {
        expect(isValidWowneroAddress("invalid_address")).toBe(false);
    });
});

describe('Amount Validation Tests', () => {
    test('isValidAmount should accept valid amounts', () => {
        expect(isValidAmount("123.456")).toBe(true);
        expect(isValidAmount("123")).toBe(true);
    });

    test('isValidAmount should reject invalid amounts', () => {
        expect(isValidAmount("123.4567890")).toBe(false);
        expect(isValidAmount("invalid_amount")).toBe(false);
    });
});

describe('Conversion Tests', () => {
    test('wowToMega should convert Wow to Mega correctly', () => {
        expect(wowToMega("1000000000000").toString()).toBe("10");
    });

    test('MegaToWow should convert Mega to Wow correctly', () => {
        expect(MegaToWow("10").toString()).toBe("1000000000000");
    });

    test('RawToMega should convert RAW to Mega correctly', () => {
        expect(RawToMega("1000000000000000000000000000000")).toBe("1.000000000000000000000000000000");
    });

    test('MegaToRaw should convert Mega to RAW correctly', () => {
        expect(MegaToRaw("1000000")).toBe("1000000000000000000000000000000000000");
    });
});

describe('Username and Password Validation Tests', () => {
    test('isValidUsername should accept valid usernames', () => {
        expect(isValidUsername("valid_username")).toBe(true);
    });

    test('isValidUsername should reject usernames longer than 30 characters', () => {
        expect(isValidUsername("thisusernameiswaytoolongtobevalid1234567890")).toBe(false);
    });

    test('isValidUsername should reject invalid usernames', () => {
        expect(isValidUsername("invalid username with spaces")).toBe(false);
    });

    test('isValidPassword should accept valid passwords', () => {
        expect(isValidPassword("ValidPassword123!")).toBe(true);
    });

    test('isValidPassword should reject passwords with invalid characters', () => {
        expect(isValidPassword("password$123")).toBe(false);
        expect(isValidPassword("password*123")).toBe(false); 
        expect(isValidPassword("password+123")).toBe(false);
        expect(isValidPassword("password(123)")).toBe(false);
        expect(isValidPassword("password%123")).toBe(false);
    });

    test('isValidPassword should reject passwords with SQL injection sequences', () => {
        expect(isValidPassword("password;drop")).toBe(false);
        expect(isValidPassword("password--test")).toBe(false);
        expect(isValidPassword("password/*123")).toBe(false);
        expect(isValidPassword("password'123")).toBe(false);
        expect(isValidPassword('password"123')).toBe(false);
    });

    test('isValidPassword should reject invalid passwords', () => {
        expect(isValidPassword("short")).toBe(false);
        expect(isValidPassword("invalid_password_with_blacklisted_sequence;")).toBe(false);
    });
});

describe('UUID Validation Tests', () => {
    test('isValidUUID should accept valid UUIDs', () => {
        expect(isValidUUID("123e4567-e89b-12d3-a456-426614174000")).toBe(true);
    });

    test('isValidUUID should reject invalid UUIDs', () => {
        expect(isValidUUID("invalid-uuid")).toBe(false);
    });
});

describe('Integer Validation Tests', () => {
    test('isInteger should accept valid integers', () => {
        expect(isInteger(123)).toBe(true);
    });

    test('isInteger should reject non-integers', () => {
        expect(isInteger("123")).toBe(false);
        expect(isInteger(123.456)).toBe(false);
    });
});

describe('French Address and Number Validation Tests', () => {
    test('estNombre should accept valid numbers', () => {
        expect(estNombre("123.456")).toBe(true);
        expect(estNombre("-123.456")).toBe(true);
    });

    test('estNombre should reject invalid numbers', () => {
        expect(estNombre("invalid_number")).toBe(false);
    });
});

describe('Utility Function Tests', () => {
    test('sleep should resolve after specified time', async () => {
        const start = Date.now();
        await sleep(100);
        const end = Date.now();
        expect(end - start).toBeGreaterThanOrEqual(100);
    });

    test('calculateMultiplier should calculate correct multiplier', () => {
        expect(calculateMultiplier(20)).toBe(0.8);
    });

    test('pourcentage should calculate correct percentage', () => {
        expect(pourcentage(50, 200)).toBe(25);
    });

    test('dateToTimestamp should convert date string to timestamp', () => {
        expect(dateToTimestamp("2023-01-01T00:00:00Z")).toBe(1672531200);
    });

    test('addMinutesAndCompare should correctly compare times', () => {
        const pastDate = new Date(Date.now() - 60000).toISOString();
        expect(addMinutesAndCompare(pastDate, 1)).toBe(false);
    });
});

describe('Work Generation Tests', () => {
    test('theWork should generate valid work for a hash', async () => {
        const testHash = '0000000000000000000000000000000000000000000000000000000000000000';
        const work = await theWork(testHash);
        expect(typeof work).toBe('string');
        expect(work).toMatch(/^[0-9a-f]{16}$/); // Work should be 16 hex chars
    });

    test('theWork should reject invalid hashes', async () => {
        const invalidHash = 'invalid';
        await expect(theWork(invalidHash)).resolves.toEqual(undefined);
    });

    test('workLocal should generate valid work for a hash', async () => {
        const testHash = '0000000000000000000000000000000000000000000000000000000000000000';
        const work = await workLocal(testHash);
        expect(typeof work).toBe('string');
        expect(work).toMatch(/^[0-9a-f]{16}$/);
    });

    test('workLocal should generate different work for different hashes', async () => {
        const hash1 = '0000000000000000000000000000000000000000000000000000000000000000';
        const hash2 = '1111111111111111111111111111111111111111111111111111111111111111';
        const work1 = await workLocal(hash1);
        const work2 = await workLocal(hash2);
        expect(work1).not.toBe(work2);
    });
});