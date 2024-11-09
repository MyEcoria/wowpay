/*
** EPITECH PROJECT, 2024
** wallet.mjs
** File description:
** Middleware for handling wallet operations
*/
import express from 'express';
import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import bodyParser from 'body-parser';
import cors from 'cors';
import requestIp from 'request-ip';
import verifToken from './middleware/token.mjs';
import { createDeposit, createHistory, getInfoByToken, updateBalance } from '../modules/db.mjs';
import wownero from 'monero-nodejs-community';
import { MegaToWow, isValidAmount, isValidWowneroAddress } from '../modules/utils.mjs';
import { generateWallet, withdraw } from '../modules/wallet.mjs';
import converters from '../config/wallets.mjs';

const router = Router();

var Wallet = new wownero();

const defaultLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 1000,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message:
        'Too many requests created from this IP, please try again after an hour',
})

router.use(express.json());
router.use(bodyParser.json());
router.use(cors({ origin: '*' }));
router.use(requestIp.mw());
router.use(defaultLimiter);

router.post('/deposit', verifToken, async (req, res) => {
    try {
        const inputData = req.body;
        const headers = req.headers;
        const currency = inputData.currency.toLowerCase();
        if (currency) {
            const user = await getInfoByToken(headers.auth);
            if (currency == "wow") {
                const wallett = await Wallet.create_address(0, null, 1);
                await createDeposit(user.username, "wow", wallett.address);
                return res.json({status: "ok", address: wallett.address});
            } else if (currency == "xno" || currency == "ban" || currency == "xdg" || currency == "xro" || currency == "ana") {
                const ticket = currency;
                let prefix = converters[ticket.toUpperCase()].prefix; 
                const newAccount = await generateWallet(ticket);
                const privKey = newAccount["accounts"][0]["privateKey"];
                const pubKey = newAccount["accounts"][0]["publicKey"];
                const newAdd = newAccount["accounts"][0]["address"].replace("nano", prefix);
                await createDeposit(user.username, ticket, newAdd, privKey, pubKey);
                return res.json({ status: "ok", address: newAdd });
            } else {
                return res.json({ status: "error", error: "Invalid currency type" });
            }
        }
    } catch (error) {
        return res.json({ status: "error", error: error.message });
    }
});

router.post('/withdraw', verifToken, async (req, res) => {
    const inputData = req.body;
    const headers = req.headers;
    let currency = inputData.currency;
    currency = currency.toLowerCase();
    const user = await getInfoByToken(headers.auth);
    if (inputData.currency && inputData.amount && inputData.destination) {
        if (!isValidAmount(inputData.amount)) {
            return res.json({status: "error", error: "Invalid amount"});
        }
        if (inputData.currency == "wow") {
            if (!isValidWowneroAddress(inputData.destination)) {
                return res.json({status: "error", error: "Invalid Wownero address"});
            }
            const update = await updateBalance(user.username, "wow", MegaToWow(inputData.amount), "minus");
            if (update !== false) {
                const tr = await Wallet.transfer([{"amount": Number(inputData.amount),"address": inputData.destination}], {"account_index":0,"subaddr_indices":[0],"priority":0,"ring_size":7,"get_tx_key": true});
                if (tr.error) {
                    await updateBalance(user.username, "wow", MegaToWow(inputData.amount), "plus");
                    res.json({status: "error", error: tr.error.message});
                } else {
                    await updateBalance(user.username, "wow", MegaToWow(tr["fee"]), "minus", 1);
                    await createHistory(user.username, "withdraw", inputData.amount, tr["tx_hash"], inputData.destination, "WOW");
                    res.json(tr);
                }
            } else {
                res.json({status: "error", message: "Insufficient funds (min 1 WOW in reaserve)"});
            }
        } else if (currency == "xno" || currency == "ban" || currency == "xdg" || currency == "xro" || currency == "ana") {
            let raw = converters[inputData.currency.toUpperCase()].converter.megaToRaw(inputData.amount);
            const nUpt = await updateBalance(user.username, currency, raw, "minus");
            if (nUpt) {
                const hash = await withdraw(currency.toUpperCase(), inputData.destination, raw);
                if (hash["hash"]) {
                    await createHistory(user.username, "withdraw", inputData.amount, hash["hash"], inputData.destination, inputData.currency.toUpperCase());
                    res.json({ status: "ok", hash: hash["hash"] });
                } else {
                    await updateBalance(user.username, currency, raw, "plus");
                    res.json({ status: "error", error: "Error during transaction" });
                }
            } else {
                res.json({ status: "error", error: "Error updating balance" });
            }
        }
    }
});

export default router;
