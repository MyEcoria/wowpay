# WowPay

WowPay is a payment processing application.

## Project Structure

```plaintext
.
├── api
│   ├── middleware
│   │   ├── cookie.mjs
│   │   ├── login.mjs
│   │   ├── register.mjs
│   │   ├── token.mjs
│   │   └── withdraw.mjs
│   ├── user.mjs
│   └── wallet.mjs
├── config
│   ├── db.exemple
│   ├── db.json
│   ├── general.exemple
│   ├── general.json
│   ├── wallets.exemple
│   └── wallets.mjs
├── Dockerfile
├── index.mjs
├── modules
│   ├── callback.mjs
│   ├── config.mjs
│   ├── db.mjs
│   ├── logger.mjs
│   ├── rpc.mjs
│   ├── unit-converter.mjs
│   ├── utils.mjs
│   ├── wallet.mjs
│   └── wownero.mjs
├── package.json
├── package-lock.json
├── push.sh
├── README.md
├── start
│   ├── callback.mjs
│   ├── scanOld.mjs
│   ├── wownero.mjs
│   └── ws.mjs
├── babel.config.cjs
├── database.sql
└── test
|  ├── rpc.test.mjs
|  ├── unit-converter.test.mjs
|  └── utils.test.mjs
```

## Getting Started

### Prerequisites

- Node.js
- Docker

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/MyEcoria/wowpay.git
    ```
2. Navigate to the project directory:
    ```sh
    cd wowpay
    ```
3. Install dependencies:
    ```sh
    npm install
    ```

### Usage
```sh
1. Installer la db:
docker-compose up
```

2. Import the database:
    Go to http://localhost:8080
    Import the `database.sql` file into the database

3. Start a wownero-wallet-rpc server
```sh
./wownero-wallet-rpc --wallet-file test --password-file password.txt --daemon-address http://node.suchwow.xyz:34568 --rpc-bind-port 18082 --disable-rpc-login
```

4. Change the credentials in the config files

1. Start the application:
    ```sh
    node index.mjs
    ```

### Docker

To build and run the Docker container:
```sh
docker build -t wowpay .
docker run -p 3000:2009 wowpay
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Donation
Nano: `nano_3ktmq6dpwcc694hrnjzfdykbqeuj4w5w8nut3uqm5pgwa4m9jmstoc4ntu6p`
Wownero: `WW3K4ebLPGtFxaNyur6jkQdsC2khrUQ9BME9cmHgaJGxAzjtwYk3JfwRFuZ5U15KEvbU1VeFUa4JmWKHZmMX2vV41uxvTQuCX`

## License

This project is licensed under the MIT License.