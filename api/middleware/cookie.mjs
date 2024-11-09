/*
** EPITECH PROJECT, 2024
** cookie.mjs
** File description:
** Middleware for handling cookie authentication
*/
import { getInfoByCookie } from "../../modules/db.mjs";
import { isValidUUID } from "../../modules/utils.mjs";

export default async (req, res, next) => {
    const headers = req.headers;
    if (headers.auth) {
        if (isValidUUID(headers.auth)) {
            const user = await getInfoByCookie(headers.auth);
            if (user) {
                next()
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