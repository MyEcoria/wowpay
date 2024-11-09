/*
** EPITECH PROJECT, 2024
** utils.mjs
** File description:
** Utility functions for various operations
*/
import { tools } from 'nanocurrency-web-multy';
import * as nanocurrency from 'nanocurrency';
import { config_general } from './config.mjs';
import { work_generate } from './rpc.mjs';
import axios from 'axios';
import Decimal from 'decimal.js';
import crypto from 'crypto';

// Check if a string is a valid URL
export function isValidURL(string) {
    try {
        const url = new URL(string);
        if (url.protocol === "http:" || url.protocol === "https:") {
            return true;
        } else {
            return false;
        }
    } catch (e) {
        return false;
    }
}

// Check if a string is a valid cryptocurrency address
export function isValidAddress(address) {
    const regexNano = /^nano_[13][0-9a-z]{59}$/;
    const regexBanano = /^ban_[13][0-9a-z]{59}$/;
    const regexAnanos = /^ana_[13][0-9a-z]{59}$/;
    const regexRaiblocksOne = /^xro_[13][0-9a-z]{59}$/;
    const regexDogeNano = /^xdg_[13][0-9a-z]{59}$/;

    return regexNano.test(address) ||
           regexBanano.test(address) ||
           regexAnanos.test(address) ||
           regexRaiblocksOne.test(address) ||
           regexDogeNano.test(address);
}

// Check if a string is a valid Wownero address
export function isValidWowneroAddress(address) {
    const regex = /^(WW|Wo)[0-9A-Za-z]{93,104}$/;
    return regex.test(address);
}

// Check if a string is a valid amount (up to 6 decimal places)
export function isValidAmount(input) {
    let num = parseFloat(input);
    if (isNaN(num)) {
        return false;
    }

    const regex = /^\d+(\.\d{1,6})?$/;
    return regex.test(input);
}

// Convert Wow to Mega
export function wowToMega(number) {
    let num = new Decimal(number);
    let result = num.dividedBy(new Decimal('1e11'));
    return result;
}

// Convert Mega to Wow
export function MegaToWow(number) {
    let num = new Decimal(number);
    let result = num.times(new Decimal('1e11'));
    return result;
}

// Check if a string is a valid username
export function isValidUsername(username) {
    if (username.length >= 30) {
        return false;
    }

    const validUsernameRegex = /^[a-zA-Z0-9_\-@#!?\/\\&]+$/;

    if (!validUsernameRegex.test(username)) {
        return false;
    }

    return true;
}

// Check if a string is a valid password
export function isValidPassword(password) {
    if (password.length < 8 || password.length > 30) {
        return false;
    }

    const validPasswordRegex = /^[a-zA-Z0-9_\-@#!?.\/\\&]+$/;

    if (!validPasswordRegex.test(password)) {
        return false;
    }

    const blacklistedSequences = [
        "'", "\"", ";", "--", "/*", "*/", "xp_", "exec", "select", "insert", "update", "delete", "drop", "alter", "create", "grant", "revoke"
    ];

    for (const sequence of blacklistedSequences) {
        if (password.toLowerCase().includes(sequence)) {
            return false;
        }
    }

    return true;
}

// Check if a string is a valid UUID
export function isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return uuidRegex.test(uuid);
}

// Check if a value is an integer
export function isInteger(value) {
    return Number.isInteger(value);
}

// Check if a string is a valid number (French)
export function estNombre(texte) {
    const regexNombre = /^-?\d*\.?\d+(?:[eE][-+]?\d+)?$/;
    return regexNombre.test(texte);
}

// Convert RAW to Mega
export function RawToMega(amount) {
    const converted = tools.convert(amount, 'RAW', 'NANO');
    return converted;
}

// Convert Mega to RAW
export function MegaToRaw(amount) {
    const converted = tools.convert(amount, 'NANO', 'RAW');
    return converted;
}

// Sleep for a specified number of milliseconds
export async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Calculate the multiplier for a given percentage
export function calculateMultiplier(percentage) {
    return 1 - (percentage / 100);
}

// Calculate the percentage of a part relative to the total
export function pourcentage(partie, total) {
    return (partie / total) * 100;
}

// Generate work locally for a given hash
export async function workLocal(hash) {
    return new Promise((resolve, reject) => {
        nanocurrency.computeWork(hash)
            .then(pow => {
                resolve(pow);
            })
            .catch(error => {
                console.log("Erreur lors du calcul du travail :", error);
                reject(error);
            });
    });
}

// Generate work either locally or remotely based on configuration
export async function theWork(hash) {
    return new Promise(async (resolve, reject) => {
        if (config_general()["work"] === "remote") {
            const work = await work_generate(hash);
            resolve(work["work"]);
        } else {
            const work = await workLocal(hash);
            resolve(work);
        }
    });
}

// Convert a date string to a Unix timestamp
export function dateToTimestamp(dateTimeString) {
    const dateTime = new Date(dateTimeString);
    return Math.floor(dateTime.getTime() / 1000);
}

// Add minutes to a date and compare with the current time
export function addMinutesAndCompare(dateTimeString, minutesToAdd) {
    const timestamp = dateToTimestamp(dateTimeString);
    const updatedTimestamp = timestamp + (minutesToAdd * 60);
    const currentTimestamp = Math.floor(Date.now() / 1000);
    return updatedTimestamp < currentTimestamp;
}

// Check if a string is a valid HMAC SHA256 signature
export function isValidSign(signature) {
    const regex = /^[A-Za-z0-9+/=]{44}$/;
    if (!regex.test(signature)) {
        return false;
    }

    try {
        const decoded = Buffer.from(signature, 'base64');
        return decoded.length === 32;
    } catch (e) {
        return false;
    }
}