/*
** EPITECH PROJECT, 2024
** register.mjs
** File description:
** Middleware for handling registration requests
*/
import { getInfoByUsername } from "../../modules/db.mjs";
import { isValidPassword, isValidURL, isValidUsername } from "../../modules/utils.mjs";

export default async (req, res, next) => {
    const inputData = req.body;
    if (inputData.username && inputData.password && inputData.auth) {
        if (isValidUsername(inputData.username)) {
            if (isValidPassword(inputData.password)) {
                if (isValidPassword(inputData.auth)) {
                    if (isValidURL(inputData.callback)) {
                        const ifExist = await getInfoByUsername(inputData.username);
                        if (ifExist) {
                            res.status(401).json({ error: "User already exist" });
                            return;
                        } else {
                            next()
                            return
                        }
                    } else {
                        res.status(401).json({ error: "Invalid callback" });
                        return;
                    }
                } else {
                    res.status(401).json({ error: "Caractères non autorisé dans le auth (min 8 caractères)" });
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