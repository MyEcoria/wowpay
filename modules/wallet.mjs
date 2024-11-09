/*
** EPITECH PROJECT, 2024
** wallet.mjs
** File description:
** Module for handling wallet operations
*/
import { wallet as kWallet, block as poolBlock } from 'nanocurrency-web-multy';
import { wallet as walletLib, block } from 'multi-nano-web';
import { account_infos, work_generate, process, block_count } from './rpc.mjs';
import { subscribeNewAddresses } from '../start/ws.mjs';
import { MegaToRaw, RawToMega, sleep, theWork } from './utils.mjs';
import Decimal from 'decimal.js';
import { getAddInfo } from './db.mjs';
import wallets from '../config/wallets.mjs';

export async function generateWallet(currency) {
    try {
        const nanoWallet = kWallet.generate();
        let prefix = wallets[currency.toUpperCase()].prefix;
        
        const accountP = nanoWallet.accounts[0].address; // Suppose que la chaîne de caractères est stockée dans une propriété "address"
        const account = accountP.replace("nano", prefix);


        //await ajouterAdresse(account.address, 0, account.privateKey, account.publicKey);

        let addresses = [account];
        
        subscribeNewAddresses(currency.toUpperCase(), addresses);

        return nanoWallet;
    } catch (error) {
        console.log(error);
        return false;
    }
}

export async function receive(account, pendingTx) {
    try {
        const dbAccount = await getAddInfo(account);
        const addInfo = await account_infos(account, dbAccount.token);
        let rep = wallets[dbAccount.token.toUpperCase()].representative;
        
        if (dbAccount) {
            let data = {
                toAddress: account,
                transactionHash: pendingTx.hash,
                amountRaw: pendingTx.amount,
            };

            if (addInfo.error === "Account not found") { // open block
                data["walletBalanceRaw"] = "0";
                data["representativeAddress"] = rep; // default rep
                data["frontier"] = "0000000000000000000000000000000000000000000000000000000000000000";
                data['work'] = (await theWork(dbAccount["pubkey"]));
            } else {
                data["walletBalanceRaw"] = addInfo.balance;
                data["representativeAddress"] = addInfo.representative;
                data["frontier"] = addInfo.frontier;
                data['work'] = (await theWork(addInfo["frontier"]));
            }
            const signedBlock = block.receive(data, dbAccount["privkey"]);
            let r = await process(signedBlock, "receive", dbAccount.token);
            return r;
        } else {
            return false;
        }
    } catch (error) {
        console.log(error);
        return false;
    }
}

export async function receiveHot(ticket, pendingTx) {
    try {
        const add = wallets[ticket.toUpperCase()];
        const addInfo = await account_infos(add.mainAccountHot, ticket);
        if (add) {
            let data = {
                toAddress: add.mainAccountHot,
                transactionHash: pendingTx.hash,
                amountRaw: pendingTx.amount,
            };

            if (addInfo.error === "Account not found") { // open block
                data["walletBalanceRaw"] = "0";
                data["representativeAddress"] = add.representative; // default rep
                data["frontier"] = "0000000000000000000000000000000000000000000000000000000000000000";
                data['work'] = (await theWork(add.pubKey));
            } else {
                data["walletBalanceRaw"] = addInfo.balance;
                data["representativeAddress"] = addInfo.representative;
                data["frontier"] = addInfo.frontier;
                data['work'] = (await theWork(addInfo["frontier"]));
            }
            const signedBlock = block.receive(data, add.privateKey);
            let r = await process(signedBlock, "receive", ticket);
            return r;
        } else {
            return false;
        }
    } catch (error) {
        console.log(error);
        return false;
    }
}

export async function send(source, destination, amount) {
        const dbAccount = await getAddInfo(source);
        const addInfo = await account_infos(source, dbAccount.token);

        const data = {
            walletBalanceRaw: addInfo.balance,
            fromAddress: source,
            toAddress: destination,
            representativeAddress: addInfo.representative,
            frontier: addInfo.frontier,
            amountRaw: amount,
            work: (await theWork(addInfo.frontier)),
        };
        const signedBlock = poolBlock.send(data, dbAccount["privkey"]);
        let r = await process(signedBlock, "send", dbAccount.token);
        return r;
}

export async function withdraw(ticket, destination, amount) {
        const compte = wallets[ticket.toUpperCase()];
        const addInfo = await account_infos(compte["mainAccountHot"], ticket);     

        const data = {
            walletBalanceRaw: addInfo.balance,
            fromAddress: compte["mainAccountHot"],
            toAddress: destination,
            representativeAddress: addInfo.representative,
            frontier: addInfo.frontier,
            amountRaw: amount,
            work: (await theWork(addInfo.frontier)),
        };
        const signedBlock = poolBlock.send(data, compte["privateKey"]);
        let r = await process(signedBlock, "send", ticket);
        return r;
}