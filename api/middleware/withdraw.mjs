/*
** EPITECH PROJECT, 2024
** withdraw.mjs
** File description:
** Middleware for handling withdrawal requests
*/
import { getInfoByCookie, getInfoByToken, getInfoByUsername } from "../../modules/db.mjs";
import { isValidAddress, isValidAmount, isValidPassword, isValidUUID, isValidUsername, isValidWowneroAddress } from "../../modules/utils.mjs";

export default async (req, res, next) => {
    const inputData = req.body;
    const headers = req.headers;
    if (headers.auth) {
        if (isValidUUID(headers.auth)) {
            const user = await getInfoByToken(headers.auth);
            if (user) {
                if (inputData.currency == "wow" || inputData.currency == "xno" || inputData.currency == "ban" || inputData.currency == "xdg" || inputData.currency == "ana" || inputData.currency == "xro") {
                    if (isValidAmount(inputData.amount)) {
                        if (inputData.currency == "wow") {
                            if (isValidWowneroAddress(inputData.destination)) {
                                next()
                                return
                            } else {
                                res.status.json({ error: "Wrong destination" });
                                return; 
                            }
                        } else {
                            if (isValidAddress(inputData.destination)) {
                                next()
                                return
                            } else {
                                res.status.json({ error: "Wrong destination" });
                                return; 
                            }
                        }
                        
                    } else {
                        res.json({ error: "Wrong amount" });
                        return; 
                    }                    
                } else {
                    res.json({ error: "Wrong currency" });
                    return; 
                }                
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