/*
** EPITECH PROJECT, 2024
** config.mjs
** File description:
** Configuration module for general settings
*/
import generalConfig from '../config/general.json' with { type: 'json' };

export function config_general() {
    return generalConfig;
}