/*
** EPITECH PROJECT, 2024
** rpc.mjs
** File description:
** Module for handling RPC requests
*/
import axios from 'axios';
import { config_general } from './config.mjs';
import wallets from '../config/wallets.mjs';
const apiUrl = config_general()["node_url"];
let workUrl;
if (config_general()["work"] === "remote" && config_general()["work_url"] != undefined) {
    workUrl = config_general()["work_url"];
} else if (config_general()["work"] === "remote") {
    workUrl = config_general()["node_url"];
}

const headers = {
    'Content-Type': 'application/json',
    'nodes-api-key': config_general()["NODES_API_KEY"],
};   


export function account_infos(account, ticket) {
    return new Promise((resolve, reject) => {
        const data = {
            action: 'account_info',
            account: account,
            representative: 'true',
            weight: "true"
        };
        axios.post(wallets[ticket.toUpperCase()].RPC, data, { headers })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                console.log(error);
                reject(false);
            });
    });
}

export function account_pending(account, ticket) {
    return new Promise((resolve, reject) => {
        const data = {
            action: 'receivable',
            account: account,
            count: "100",
            threshold: "1000000000000000000000000"
        };
        axios.post(wallets[ticket.toUpperCase()].RPC, data, { headers })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                console.log(error);
                reject(false);
            });
    });
}

export function account_balance(account, ticket) {
    return new Promise((resolve, reject) => {
        const data = {
            action: 'account_balance',
            account: account
        };

        axios.post(wallets[ticket.toUpperCase()].RPC, data, { headers })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(false);
            });
    });
}

export async function work_generate(frontier) {
    return new Promise((resolve, reject) => {
        const data = {
            action: 'work_generate',
            hash: frontier
        };

        axios.post(workUrl, data, { headers })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                console.log(error);
                reject(false);
            });
    });
}

export async function block_count(ticket) {
    return new Promise((resolve, reject) => {
        const data = {
            action: 'block_count'
        };

        axios.post(wallets[ticket.toUpperCase()].RPC, data, { headers })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(false);
            });
    });
}

export async function process(block, subtype, ticket) {
    return new Promise((resolve, reject) => {
        const data = {
            action: "process",
            json_block: "true",
            subtype: subtype,
            block: block
        };

        axios.post(wallets[ticket.toUpperCase()].RPC, data, { headers })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                console.log(error);
                reject(false);
            });
    });
}

export async function pending(account, ticket) {
    return new Promise((resolve, reject) => {
        const data = {
            action: "pending",
            account: account,
            threshold: "1"
        };

        axios.post(wallets[ticket.toUpperCase()].RPC, data, { headers })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(false);
            });
    });
}

export async function delegators(account) {
    return new Promise((resolve, reject) => {
        const data = {
            action: "delegators",
            account: account
        };
        axios.post(apiUrl, data, { headers })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(false);
            });
    });
}