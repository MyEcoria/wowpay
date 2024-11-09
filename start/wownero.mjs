/*
** EPITECH PROJECT, 2024
** wownero.mjs
** File description:
** Script for handling Wownero transactions and balance updates
*/
import wownero from 'monero-nodejs-community';
import { createHistory, getCallbackTX, getUserFromAddress, updateBalance } from '../modules/db.mjs';
import Decimal from 'decimal.js';
import { sleep, wowToMega } from '../modules/utils.mjs';
import { logger } from '../modules/logger.mjs';

var Wallet = new wownero();

export default async function main(queue) {
    while (true) {
        const accounts = await Wallet.address();
        for (const account of accounts.addresses) {
            const bal = await Wallet.balance(0, [account.address_index]);
            const balance = bal["per_subaddress"][0];
            if (balance["balance"] !== 0) {
                const deposit = await getUserFromAddress(account.address);
                if (deposit) {
                    const history = await Wallet.incomingTransfers("all", 0, account.address_index);
                    if (history.transfers && history.transfers.length > 0) {
                        const lastTransfer = history.transfers[history.transfers.length - 1];
                        const ifAlreadySend = await getCallbackTX(lastTransfer.tx_hash);
                        if (!ifAlreadySend) {
                            logger.log({ level: 'info', message: `New pending transaction ${lastTransfer.tx_hash}` });

                            queue.enqueue({ username: deposit.username, ticket: "WOW", amount: wowToMega(balance["balance"]), address: account.address, status: "pending", tx_hash: lastTransfer.tx_hash, tx_status: "pending" });
                        }
                    }
                }
            }
            if (account.address_index !== 0) {
                if (balance["unlocked_balance"] !== 0 && balance["unlocked_balance"] >= 0.01) {
                   
                    const sweep = await Wallet.sweep_all(accounts.address, 0, account.address_index);
                    const deposit = await getUserFromAddress(account.address);
                    if (deposit) {
                        const newBalance = new Decimal(balance["unlocked_balance"])
                            .minus(new Decimal(sweep.fee_list[0]))
                            .toNumber();
                        await updateBalance(deposit.username, "wow", newBalance, "plus");
                        await createHistory(deposit.username, "deposit", wowToMega(newBalance), sweep.tx_hash_list[0], account.address, "WOW");
                        queue.enqueue({ username: deposit.username, ticket: "WOW", amount: wowToMega(newBalance), address: account.address, tx_hash: sweep.tx_hash_list[0], tx_status: "finish" });
                    }
                }
            }
        }
        await sleep(10000);
    }
} 
