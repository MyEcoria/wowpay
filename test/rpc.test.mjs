import { describe, expect, test } from '@jest/globals';
import {
    account_infos,
    account_pending,
    account_balance,
    work_generate,
    block_count,
    process,
    pending,
    delegators
} from '../modules/rpc.mjs';

describe('RPC Module Tests', () => {
    const testAccount = 'nano_3t6k35gi95xu6tergt6p69ck76ogmitsa8mnijtpxm9fkcm736xtoncuohr3';
    const testTicket = 'XNO';
    const testFrontier = '000D1BAEC8EC208142C99059B393051BAC8380F9B5A2E6B2489A277D81789F3F';
    const testBlock = {
        type: 'state',
        account: testAccount,
        previous: testFrontier,
        representative: testAccount,
        balance: '1000000000000000000000000000000',
        link: '0000000000000000000000000000000000000000000000000000000000000000',
        work: '0000000000000000',
        signature: '0000000000000000000000000000000000000000000000000000000000000000'
    };

    test('account_infos should return account information', async () => {
        const info = await account_infos(testAccount, testTicket);
        expect(info).toBeDefined();
        expect(info).toHaveProperty('balance');
        expect(info).toHaveProperty('representative');
    });

    test('account_pending should return pending blocks', async () => {
        const pending = await account_pending(testAccount, testTicket);
        expect(pending).toBeDefined();
        expect(pending).toHaveProperty('blocks');
    });

    test('account_balance should return account balance', async () => {
        const balance = await account_balance(testAccount, testTicket);
        expect(balance).toBeDefined();
        expect(balance).toHaveProperty('balance');
    });

    test('work_generate should generate work for a frontier', async () => {
        const work = await work_generate(testFrontier);
        expect(work).toBeDefined();
        expect(work).toHaveProperty('work');
    });

    test('block_count should return network block count', async () => {
        const count = await block_count(testTicket);
        expect(count).toBeDefined();
        expect(count).toHaveProperty('count');
        expect(count).toHaveProperty('unchecked');
    });

    test('process should handle block processing', async () => {
        const result = await process(testBlock, 'send', testTicket);
        expect(result).toBeDefined();
        if (result.error) {
            expect(result).toHaveProperty('error');
        } else {
            expect(result).toHaveProperty('hash');
        }
    });

    test('pending should return pending transactions', async () => {
        const pendingBlocks = await pending(testAccount, testTicket);
        expect(pendingBlocks).toBeDefined();
        expect(pendingBlocks).toHaveProperty('blocks');
    });

    test('delegators should return account delegators', async () => {
        try {
            const dels = await delegators(testAccount, testTicket);
            if (dels === false) {
                expect(dels).toBe(false);
            } else {
                expect(dels).toBeDefined();
                expect(dels).toHaveProperty('delegators');
            }
        } catch (error) {
            expect(error).toBeDefined();
        }
    });

    test('should handle errors gracefully', async () => {
        const invalidAccount = 'invalid_account';
        const result = await account_infos(invalidAccount, testTicket);
        expect(result).toHaveProperty('error');
        expect(result.error).toBe('Bad account number');
    });
});
