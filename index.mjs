/*
** EPITECH PROJECT, 2024
** index.mjs
** File description:
** Main entry point for the wallet backend application
*/
import express from 'express';
import http from 'http';
import config from './config/general.json' assert { type: 'json' };
import { logger } from './modules/logger.mjs';
import router from './api/user.mjs';
import deposit from './api/wallet.mjs';
import scanWownero from './start/wownero.mjs';
import call from './start/callback.mjs';
import Queue from './modules/callback.mjs'
import wallets from './config/wallets.mjs';
import { subscribeNewAddresses, subscribeToAllActiveAddresses } from './start/ws.mjs';
import { scanOldDeposit } from './start/scanOld.mjs';
import helmet from 'helmet';

const app = express();
const port = config.port;

const queue = new Queue();
const server = http.createServer(app);

app.use(express.json());
app.use(helmet());
app.disable('x-powered-by');
app.use('/user', router);
app.use('/wallet', deposit);

await call(queue);

server.listen(port, () => {
    logger.log({ level: 'info', message: `Wallet backend started and listening on http://localhost:${port}` });
    scanOldDeposit(queue);
    subscribeToAllActiveAddresses(queue).then(() => {
        let addresses;
        addresses = [wallets["XNO"].mainAccountHot];
        subscribeNewAddresses("XNO", addresses);
        addresses = [wallets["BAN"].mainAccountHot];
        subscribeNewAddresses("BAN", addresses);
        addresses = [wallets["ANA"].mainAccountHot];
        subscribeNewAddresses("ANA", addresses);
        addresses = [wallets["XDG"].mainAccountHot];
        subscribeNewAddresses("XDG", addresses);
        addresses = [wallets["XRO"].mainAccountHot];
        subscribeNewAddresses("XRO", addresses);
    });
    scanWownero(queue)
});