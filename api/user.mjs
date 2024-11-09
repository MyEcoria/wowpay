/*
** EPITECH PROJECT, 2024
** user.mjs
** File description:
** Middleware for handling user-related requests
*/
import express from 'express';
import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import bodyParser from 'body-parser';
import cors from 'cors';
import requestIp from 'request-ip';
import verifRegister from './middleware/register.mjs';
import verifLogin from './middleware/login.mjs';
import verifCookie from './middleware/cookie.mjs';
import { createCookie, createToken, createUser, getAllToken, getInfoByCookie, getInfoByUsername, getLatestFive, getLatestFourtyCallback, getLatestFourtyTransactions, getUserInfo, updateCallback, updateCallbackAuth, updateCallbackUrl } from '../modules/db.mjs';
import md5 from 'md5';
import { v4 as uuidv4 } from 'uuid';
import { isValidPassword, isValidURL, wowToMega } from '../modules/utils.mjs';
import converters from '../config/wallets.mjs';

const router = Router();

const defaultLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 1000,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message:
        'Too many requets created from this IP, please try again after an hour',
})

router.use(express.json());
router.use(bodyParser.json());
router.use(cors({ origin: '*' }));
router.use(requestIp.mw());
router.use(defaultLimiter);

router.post('/register', verifRegister, async (req, res) => {
    const inputData = req.body;
    const hashPassword = md5(inputData.password);
    const create = await createUser(inputData.username, hashPassword, inputData.callback, inputData.auth);

    if (create !== false) {
        res.json({status: "ok"});
    } else {
        res.json({status: "error"});
    }
});

router.post('/login', verifLogin, async (req, res) => {
    const inputData = req.body;
    const newUuid = uuidv4();

    await createCookie(inputData.username, newUuid);

    res.json({status: "ok", cookie: newUuid});
});

router.post('/create-token', verifCookie, async (req, res) => {
    const headers = req.headers;
    const user = await getInfoByCookie(headers.auth);
    const newUuid = uuidv4();
    const newPrivateKey = uuidv4();

    await createToken(user.username, newUuid, newPrivateKey);

    res.json({status: "ok", token: newUuid, private: newPrivateKey});
});

router.get('/infos', verifCookie, async (req, res) => {
    const headers = req.headers;
    const user = await getInfoByCookie(headers.auth);

    const infos = await getUserInfo(user.username);

    let megaXNO = converters["XNO"].converter.rawToMega(infos.xno);
    let megaBAN = converters["BAN"].converter.rawToMega(infos.ban);
    let megaXRO = converters["XRO"].converter.rawToMega(infos.xro);
    let megaANA = converters["ANA"].converter.rawToMega(infos.ana);
    let megaXDG = converters["XDG"].converter.rawToMega(infos.xdg);

    let megaWOW = wowToMega(infos.wow);

    res.json({created_at: infos.created_at, username: infos.username, callback: infos.callback, auth: infos.auth.length, xno: megaXNO, ban: megaBAN, xro: megaXRO, ana: megaANA, xdg: megaXDG, wow: megaWOW});
});

router.get('/latestfive', verifCookie, async (req, res) => {
    const headers = req.headers;
    const user = await getInfoByCookie(headers.auth);

    const infos = await getLatestFive(user.username);

    res.json(infos);
});

router.get('/latestfourty', verifCookie, async (req, res) => {
    const headers = req.headers;
    const user = await getInfoByCookie(headers.auth);

    const infos = await getLatestFourtyCallback(user.username);

    res.json(infos);
});

router.get('/latestfourtyhistory', verifCookie, async (req, res) => {
    const headers = req.headers;
    const user = await getInfoByCookie(headers.auth);

    const infos = await getLatestFourtyTransactions(user.username);

    res.json(infos);
});

router.post('/tokens', verifCookie, async (req, res) => {
    const headers = req.headers;
    const user = await getInfoByCookie(headers.auth);
    const tokens = await getAllToken(user.username)

    res.json(tokens);
});

router.post('/balance', verifCookie, async (req, res) => {
    const headers = req.headers;
    const user = await getInfoByCookie(headers.auth);
    const username = await getInfoByUsername(user.username);
    const { wow, xno, xro, ana, xdg, ban } = username;

    res.json({wow: wow, xno: xno, xro: xro, ana: ana, xdg: xdg, ban: ban});
});

router.post('/update-callback', verifCookie, async (req, res) => {
    const headers = req.headers;
    const inputData = req.body;
    const user = await getInfoByCookie(headers.auth);
    
    if (isValidURL(inputData.callback)) {
        const update = await updateCallbackUrl(user.username, inputData.callback);
        if (update) {
            res.json({status: "ok"});
        } else {
            res.json({status: "error", error: "unknow"});
        }
    } else {
        res.json({status: "error", error: "invalid url"});
    }
});

router.post('/update-auth', verifCookie, async (req, res) => {
    const headers = req.headers;
    const inputData = req.body;
    const user = await getInfoByCookie(headers.auth);
    
    if (inputData.auth && isValidPassword(inputData.auth)) {
        const update = await updateCallbackAuth(user.username, inputData.auth);
        if (update) {
            res.json({status: "ok"});
        } else {
            res.json({status: "error", error: "unknow"});
        }
    } else {
        res.json({status: "error", error: "invalid url"});
    }
});

export default router;
