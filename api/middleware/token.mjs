/*
** EPITECH PROJECT, 2024
** token.mjs
** File description:
** Middleware for handling token authentication
*/
import { getInfoByCookie, getInfoByToken, getInfoByUsername } from "../../modules/db.mjs";
import { isInteger, isValidPassword, isValidSign, isValidUUID, isValidUsername } from "../../modules/utils.mjs";
import crypto from 'crypto';

export default async (req, res, next) => {
    const inputData = req.body;
    const headers = req.headers;
    const ts = Date.now();

    if (headers.auth && headers.sign && inputData.time) {
        if (isValidUUID(headers.auth) && isValidSign(headers.sign) && isInteger(inputData.time)) {
            const user = await getInfoByToken(headers.auth);
            if (user) {
                const withdrawalRequestBody = JSON.stringify(inputData);
                const withdrawalRequestSign = crypto
                    .createHmac('sha256', user.private)
                    .update(withdrawalRequestBody)
                    .digest('base64');
                if (withdrawalRequestSign === headers.sign) {
                    const timeData = inputData.time;
                    if (ts - timeData <= 10 * 60 * 1000) {
                        next();
                        return;
                    } else {
                        res.json({ error: "Request time exceeded 10 minutes" });
                        return;
                    }
                } else {
                    res.json({ error: "Invalid signature" });
                    return;
                }
                return
            } else {
                res.status(401).json({ error: "Cookie not found" });
                return;
            }
        } else {
            res.status(401).json({ error: "Invalid uuid" });
            return;
        }
    } else {
        res.status(401).json({ error: "Merci de fournir un username/password" });
        return;
    }
};