/*
** EPITECH PROJECT, 2024
** callback.mjs
** File description:
** Middleware for handling callback requests
*/
import { getAllCallback } from "../modules/db.mjs";

export default async function main(queue) {
    const callback = await getAllCallback();
    if (callback) {
        for (const call of callback) {
            queue.enqueue(call, true);
        }
    }
}