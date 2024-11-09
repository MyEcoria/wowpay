/*
** EPITECH PROJECT, 2024
** login.mjs
** File description:
** Middleware for handling login requests
*/
import { checkPassword, getInfoByUsername } from "../../modules/db.mjs";
import { isValidPassword, isValidUsername } from "../../modules/utils.mjs";
import md5 from "md5";

export default async (req, res, next) => {
    const inputData = req.body;

    if (inputData.username && inputData.password) {
        if (isValidUsername(inputData.username)) {
            if (isValidPassword(inputData.password)) {
                const hashPassword = md5(inputData.password);
                const ifPassword = await checkPassword(inputData.username, hashPassword);
                if (ifPassword) {
                    next()
                    return
                } else {
                    res.status(401).json({ error: "Wrong Password" });
                return;
                }
            } else {
                res.status(401).json({ error: "Caractères non autorisé dans le password" });
                return;
            }
        } else {
            res.status(401).json({ error: "Caractères non autorisé dans le username" });
            return;
        }
    } else {
        res.status(401).json({ error: "Merci de fournir un username/password" });
        return;
    }
};