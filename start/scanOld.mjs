/*
** EPITECH PROJECT, 2024
** scanOld.mjs
** File description:
** Middleware for handling old deposit scans
*/
import { getAllAdd, updateBalance } from '../modules/db.mjs';
import { receive, send } from '../modules/wallet.mjs';
import { account_balance, account_pending } from "../modules/rpc.mjs";
import converters from '../config/wallets.mjs';
import { sleep } from '../modules/utils.mjs';

export async function scanOldDeposit(queue) {
    const adress = await getAllAdd();
    if (adress.length > 0) {
        for (const row of adress) {
        const theAdd = row.address;
        const theTicket = row.token;
        const theUsername = row.username;

        if (theTicket.toLowerCase() !== "wow") {
            const pending = await account_pending(theAdd, theTicket);
            if (pending.blocks) {
                    for (const [blockId, amount] of Object.entries(pending.blocks)) {
                        let pendingTx = {
                            hash: blockId,
                            amount: amount,
                        };
                        const rr = await receive(theAdd, pendingTx);
                    }
            }
            await sleep(1000);
            const balance = await account_balance(theAdd, theTicket.toUpperCase());
            if (balance.balance > 0) {
                let mainAccount = converters[theTicket.toUpperCase()].mainAccountHot;
                let mega = converters[theTicket.toUpperCase()].converter.rawToMega(balance.balance);
                const send3 = await send(theAdd, mainAccount, balance.balance);
                if (send3.hash) {
                    queue.enqueue({ username: theUsername, ticket: theTicket.toUpperCase(), amount: mega, address: theAdd, tx_hash: send3.hash, tx_status: "finish" });
                    await updateBalance(theUsername, theTicket, balance.balance, 'plus');
                }
               
            }
        }
    }
    } else {
        console.log('No accounts found in the database.');
    }
}
