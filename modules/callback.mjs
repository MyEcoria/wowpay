/*
** EPITECH PROJECT, 2024
** callback.mjs
** File description:
** Queue system for handling callback requests
*/
import axios from 'axios';
import { createCallback, getInfoByUsername, updateBalance, updateCallback } from './db.mjs';

export default class Queue {
    constructor() {
        this.queue = [];
        this.isProcessing = false;
    }

    async enqueue(data, isDB = false) {
        if (isDB == false) {
            const cl = await createCallback(data.username, data.ticket, data.amount, data.address, data.tx_hash, data.tx_status);
            data.id = cl;
        }
        this.queue.push(data);
        this.processQueue();
    }

    async processQueue() {
        if (this.isProcessing) {
            return;
        }

        this.isProcessing = true;

        while (this.queue.length > 0) {
            const data = this.queue.shift();

            const sen = await this.sendData(data);
            if (sen !== true) {
                console.error('Error sending data, re-enqueueing with delay...');
                await this.sleep(5000); // Adding a delay before re-enqueuing
                this.queue.push(data);  // Re-enqueue the failed item
            }
        }

        this.isProcessing = false;
    }

    async sendData(data) {
        try {
            const user = await getInfoByUsername(data.username);
            const idT = data.id;
            const url = user.callback;
            delete data.id;
    
            const headers = {
                'Content-Type': 'application/json',
                'auth': user.auth
            };
    
            const response = await axios.post(url, data, { headers });
            if (response.status === 200) {
                await updateCallback(data.tx_hash);
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
