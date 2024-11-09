/*
** EPITECH PROJECT, 2024
** ws.mjs
** File description:
** WebSocket management for handling confirmations and updates
*/
import WS from 'ws';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { logger } from '../modules/logger.mjs';
import converters from '../config/wallets.mjs';
import BigNumber from 'bignumber.js';
import { createHistory, getAddInfo, getAllAdd, updateBalance } from '../modules/db.mjs';
import { receive, receiveHot, send } from '../modules/wallet.mjs';
import wallets from '../config/wallets.mjs';

BigNumber.config({ ROUNDING_MODE: BigNumber.ROUND_DOWN });
var websockets = {};

const WS_OPTIONS = {
    WebSocket: WS,
    connectionTimeout: 5000,
    maxRetries: 100000,
    maxReconnectionDelay: 2000,
    minReconnectionDelay: 10,
    debug: false
};

function subscribeConfirmation(accounts, ws) {
    const confirmation_subscription = {
        "action": "subscribe",
        "topic": "confirmation",
        "ack": true,
        "options": {
            "accounts": accounts
        }
    };
    ws.send(JSON.stringify(confirmation_subscription));
}

function updateConfirmation(accounts, ws) {
    const confirmation_subscription = {
        "action": "subscribe",
        "topic": "confirmation",
        "ack": true,
        "options": {
            "accounts": accounts
        }
    };
    logger.log({ level: 'info', message: `Update ws tracking accounts`, accounts: accounts });
    ws.send(JSON.stringify(confirmation_subscription));
}

async function subscribeToAllActiveAddresses(queue) {
    let keys = Object.keys(converters);
    for (let i = 0; i < keys.length; i++) {
        const ticker = keys[i];
        let addressesDB = await getAllAdd();
        let addresses = addressesDB.map((addressDB) => addressDB.address);
        let wsURLs = converters[ticker].WS;
        websockets[ticker] = [];
        wsURLs.forEach(wsURL => {
            websockets[ticker].push(new ReconnectingWebSocket(wsURL, [], WS_OPTIONS));
        });

        logger.log({ level: 'info', message: `${addresses.length} ${ticker} active addresses & subscribe to ${websockets[ticker].length} ws` });
        for (let i = 0; i < websockets[ticker].length; i++) {
            const ws = websockets[ticker][i];
            ws.onmessage = async msg => { wsOnMessage(msg, ticker, queue); };
            ws.onopen = () => {
                subscribeConfirmation(addresses, ws);
                logger.log({ level: 'info', message: `ws ${ticker} opened` });
            };
            ws.onerror = (err) => {
                logger.log({ level: 'error', message: `ws ${ticker} error`, err: err });
            };
            ws.onclose = () => {
                logger.log({ level: 'info', message: `ws ${ticker} closed` });
            };
        }
    }
}

async function subscribeNewAddresses(ticker, addresses) {
    websockets[ticker].forEach(ws => {
        updateConfirmation(addresses, ws);
    });
}

async function wsOnMessage(msg, ticker, queue) {
    let data_json = JSON.parse(msg.data);
    if (data_json.topic === "confirmation" && data_json.message !== undefined && data_json.message.block.subtype === "send") {
        logger.log({ level: 'info', message: `New ws confirmation`, hash: data_json.message.hash });
        let mega = converters[ticker].converter.rawToMega(data_json.message.amount);
        let amount = new BigNumber(mega).toPrecision(15);

        logger.log({ level: 'info', message: `New ws confirmation & confirmed. Update balance`, megaAmount: amount, receivedAccount: data_json.message.block.link_as_account, hash: data_json.message.hash });

        try {
            let account = data_json.message.block.link_as_account;
            if (account == wallets[ticker.toUpperCase()].mainAccountHot) {
                let pendingTx = {
                    hash: data_json.message.hash,
                    amount: data_json.message.amount,
                };
                await receiveHot(ticker, pendingTx);
            } else {
                let depositDbFirst = await getAddInfo(account);
                const depositDb = JSON.parse(JSON.stringify(depositDbFirst));
                if (depositDb === null) {
                    logger.log({ level: 'info', message: `Send block doesn't belong to any database addresses`, account: account });
                    return;
                }
                let pendingTx = {
                    hash: data_json.message.hash,
                    amount: data_json.message.amount,
                };
                const rec = await receive(data_json.message.block.link_as_account, pendingTx);
                if (rec.hash) {
                    const send3 = await send(account, wallets[ticker.toUpperCase()].mainAccountHot, data_json.message.amount);
                    if (send3.hash) {
                        await updateBalance(depositDb["username"], ticker, data_json.message.amount, 'plus');
                        await createHistory(depositDb["username"], "deposit", mega, data_json.message.hash, account, ticker.toUpperCase());
                        queue.enqueue({ username: depositDb["username"], ticket: ticker.toUpperCase(), amount: mega, address: account, tx_hash: data_json.message.hash, tx_status: "finish" });
                    }
                }
            }
        } catch (error) {
            if (error.code === 11000) {
                logger.info("Balance already updated for this deposit");
            } else {
                logger.error(error);
            }
        }
    }
}

export {
    subscribeToAllActiveAddresses,
    subscribeNewAddresses
};