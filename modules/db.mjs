/*
** EPITECH PROJECT, 2024
** db.mjs
** File description:
** Database module for handling various database operations
*/
import mysql from 'mysql2/promise';
import config from '../config/db.json' assert { type: 'json' };
import Decimal from 'decimal.js';
import { logger } from './logger.mjs';
import { MegaToWow } from './utils.mjs';

const dbConfig = {
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database,
  //port: config.port,
};

const pool = mysql.createPool(dbConfig);

export async function createUser(username, password, callback, auth) {
  const connection = await pool.getConnection();
  try {
    const existingUser = await getInfoByUsername(username);

    if (existingUser) {
      logger.log({ level: 'info', message: `The address ${username} is already registered` });
      return false;
    }
    const sql = 'INSERT INTO users (username, password, callback, auth, wow, xno, xdg, xro, ana, ban) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const [result] = await connection.execute(sql, [username, password, callback, auth, "0", "0", "0", "0", "0", "0"]);
    logger.log({ level: 'info', message: `The address ${username} has been registered` });
    return result.insertId;
  } catch (error) {
    logger.log({ level: 'error', message: `Account creation error: ${error.message}` });
  } finally {
    connection.release();
  }
}

export async function getInfoByUsername(username) {
  const connection = await pool.getConnection();
  try {
    const sql = 'SELECT * FROM users WHERE username = ?';
    const [rows] = await connection.execute(sql, [username]);
    return rows.length ? rows[0] : null;
  } catch (error) {
    logger.log({ level: 'error', message: `Error retrieving information by username: ${error.message}` });
    return null;
  } finally {
    connection.release();
  }
}

export async function createToken(username, uuid, privateKey) {
  const connection = await pool.getConnection();
  try {
    const sql = 'INSERT INTO tokens (username, uuid, private) VALUES (?, ?, ?)';
    const [result] = await connection.execute(sql, [username, uuid, privateKey]);
    logger.log({ level: 'info', message: `The address ${username} has been registered` });
    return result.insertId;
  } catch (error) {
    logger.log({ level: 'error', message: `Token creation error: ${error.message}` });
  } finally {
    connection.release();
  }
}

export async function createDeposit(username, token, address, privateKey = null, pubKey = null) {
  const connection = await pool.getConnection();
  try {
    const sql = 'INSERT INTO deposits (username, token, address, privkey, pubkey) VALUES (?, ?, ?, ?, ?)';
    const [result] = await connection.execute(sql, [username, token, address, privateKey, pubKey]);
    logger.log({ level: 'info', message: `The address ${username} has been registered` });
    return result.insertId;
  } catch (error) {
    logger.log({ level: 'error', message: `Deposit creation error: ${error.message}` });
  } finally {
    connection.release();
  }
}

export async function checkPassword(username, password) {
  const connection = await pool.getConnection();
  try {
    const sql = 'SELECT * FROM users WHERE username = ?';
    const [rows] = await connection.execute(sql, [username]);
    if (rows.length) {
      if (rows[0].password == password) {
        return true;
      } else {
        return false;
      }
    }
  } catch (error) {
    logger.log({ level: 'error', message: `Password verification error: ${error.message}` });
    return null;
  } finally {
    connection.release();
  }
}

export async function createCookie(username, uuid) {
  const connection = await pool.getConnection();
  try {
    const sql = 'INSERT INTO cookies (username, uuid) VALUES (?, ?)';
    const [result] = await connection.execute(sql, [username, uuid]);
    logger.log({ level: 'info', message: `The address ${username} has been registered` });
    return result.insertId;
  } catch (error) {
    logger.log({ level: 'error', message: `Cookie creation error: ${error.message}` });
  } finally {
    connection.release();
  }
}

export async function getInfoByCookie(cookie) {
  const connection = await pool.getConnection();
  try {
    const sql = 'SELECT * FROM cookies WHERE uuid = ?';
    const [rows] = await connection.execute(sql, [cookie]);
    return rows.length ? rows[0] : null;
  } catch (error) {
    logger.log({ level: 'error', message: `Error retrieving information by cookie: ${error.message}` });
    return null;
  } finally {
    connection.release();
  }
}

export async function getInfoByToken(token) {
  const connection = await pool.getConnection();
  try {
    const sql = 'SELECT * FROM tokens WHERE uuid = ?';
    const [rows] = await connection.execute(sql, [token]);
    return rows.length ? rows[0] : null;
  } catch (error) {
    logger.log({ level: 'error', message: `Error retrieving information by token: ${error.message}` });
    return null;
  } finally {
    connection.release();
  }
}

export async function updateBalance(username, currencyt, newAmount, type, fee = 0) {
  const connection = await pool.getConnection();
  try {
    const currency = currencyt.toLowerCase();
    await connection.beginTransaction();

    const selectSQL = `SELECT wow, xno, xro, ana, xdg, ban FROM users WHERE username = ? FOR UPDATE`;
    const [rows] = await connection.execute(selectSQL, [username]);

    if (rows.length) {
      const { wow, xno, xro, ana, xdg, ban } = rows[0];
      const balances = { wow, xno, xro, ana, xdg, ban };
      let newBalance;
      if (type == "plus") {
        newBalance = new Decimal(balances[currency])
          .plus(new Decimal(newAmount))
          .toNumber();
      } else if (type == "minus") {
        newBalance = new Decimal(balances[currency])
          .minus(new Decimal(newAmount))
          .toNumber();
        if (currency == "wow" && newBalance < MegaToWow(1) && fee == 0) {
          await connection.commit();
          return false;
        }
      }
      if (balances[currency] < 0 || newBalance < 0) {
        logger.log({ level: 'info', message: `Negative balance: ${username} ${newBalance < 0} ${(balances[currency] < newAmount && type === "minus")}` });
        await connection.commit();
        return false;
      } else {
        const updateSQL = `UPDATE users SET ${currency} = ? WHERE username = ?`;
        const [result] = await connection.execute(updateSQL, [newBalance, username]);

        if (result.affectedRows > 0) {
          logger.log({ level: 'info', message: `Balance successfully updated for user: ${username}` });
          await connection.commit();
        } else {
          logger.log({ level: 'info', message: `No user found with username: ${username}` });
        }

        return result.affectedRows;
      }
    } else {
      return false;
    }
  } catch (error) {
    logger.log({ level: 'error', message: `Error updating balance: ${error.message}` });
    await connection.rollback();
    return 0;
  } finally {
    connection.release();
  }
}

export async function updateLatestAmount(adresse, newAmount) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const updateSQL = `UPDATE deposits SET latest_amount = ? WHERE address = ?`;
    const [result] = await connection.execute(updateSQL, [newAmount, adresse]);

    if (result.affectedRows > 0) {
      logger.log({ level: 'info', message: `Balance successfully updated for address: ${adresse}` });
      await connection.commit();
    } else {
      logger.log({ level: 'info', message: `No user found with address: ${adresse}` });
      await connection.commit();
    }
  } catch (error) {
    logger.log({ level: 'error', message: `Error updating balance: ${error.message}` });
    await connection.rollback();
    return 0;
  } finally {
    connection.release();
  }
}

export async function getUserFromAddress(address) {
  const connection = await pool.getConnection();
  try {
    const sql = 'SELECT * FROM deposits WHERE address = ?';
    const [rows] = await connection.execute(sql, [address]);
    return rows.length ? rows[0] : null;
  } catch (error) {
    logger.log({ level: 'error', message: `Error retrieving information by address: ${error.message}` });
    return null;
  } finally {
    connection.release();
  }
}

export async function getAllAdd() {
  let connection = await pool.getConnection();
  try {
    let sql = 'SELECT * FROM deposits';
    let [rows] = await connection.execute(sql);
    return rows;
  } catch (error) {
    logger.log({ level: 'error', message: `Error fetching all deposits: ${error.message}` });
    return null;
  } finally {
    connection.release();
  }
}

export async function getAddInfo(add) {
  let connection = await pool.getConnection();
  try {
    let sql = 'SELECT * FROM deposits WHERE address = ?';
    let [rows] = await connection.execute(sql, [add]);
    return rows.length ? rows[0] : null;
  } catch (error) {
    logger.log({ level: 'error', message: `Error retrieving information by address: ${error.message}` });
    return null;
  } finally {
    connection.release();
  }
}

export async function createCallback(username, ticket, amount, address, tx_hash = null, tx_status = null) {
  const connection = await pool.getConnection();
  try {
    const sql = 'INSERT INTO callback (username, ticket, amount, status, address, tx_hash, tx_status) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const [result] = await connection.execute(sql, [username, ticket, amount.toString(), "pending", address, tx_hash, tx_status]);
    logger.log({ level: 'info', message: `The address ${username} has been registered` });
    return result.insertId;
  } catch (error) {
    logger.log({ level: 'error', message: `Callback creation error: ${error.message}` });
  } finally {
    connection.release();
  }
}

export async function getAllCallback() {
  const connection = await pool.getConnection();
  try {
    const sql = 'SELECT * FROM callback WHERE status = ?';
    const [rows] = await connection.execute(sql, ["pending"]);
    return rows.length ? rows : null;
  } catch (error) {
    logger.log({ level: 'error', message: `Error retrieving callback information: ${error.message}` });
    return null;
  } finally {
    connection.release();
  }
}

export async function updateCallback(tx_hash) {
  const connection = await pool.getConnection();
  try {
    const sql = 'UPDATE callback SET status = ? WHERE tx_hash = ?';
    const [result] = await connection.execute(sql, ["finish", tx_hash]);
    if (result.affectedRows === 0) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    logger.log({ level: 'error', message: `Error updating callback: ${error.message}` });
    return null;
  } finally {
    connection.release();
  }
}

export async function getAllToken(username) {
  const connection = await pool.getConnection();
  try {
    const sql = 'SELECT * FROM tokens WHERE username = ? ORDER BY id DESC';
    const [rows] = await connection.execute(sql, [username]);
    return rows.length ? rows : null;
  } catch (error) {
    logger.log({ level: 'error', message: `Error retrieving token information: ${error.message}` });
    return null;
  } finally {
    connection.release();
  }
}

export async function updateCallbackUrl(username, callback) {
  const connection = await pool.getConnection();
  try {
    const updateSQL = `UPDATE users SET callback = ? WHERE username = ?`;
    const [result] = await connection.execute(updateSQL, [callback, username]);
    if (result.affectedRows > 0) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    logger.log({ level: 'error', message: `Error updating callback URL: ${error.message}` });
    return null;
  } finally {
    connection.release();
  }
}

export async function updateCallbackAuth(username, auth) {
  const connection = await pool.getConnection();
  try {
    const updateSQL = `UPDATE users SET auth = ? WHERE username = ?`;
    const [result] = await connection.execute(updateSQL, [auth, username]);
    if (result.affectedRows > 0) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    logger.log({ level: 'error', message: `Error updating callback auth: ${error.message}` });
    return null;
  } finally {
    connection.release();
  }
}

export async function getCallbackTX(tx_hash) {
  const connection = await pool.getConnection();
  try {
    const sql = 'SELECT * FROM callback WHERE tx_hash = ?';
    const [rows] = await connection.execute(sql, [tx_hash]);
    return rows.length ? true : false;
  } catch (error) {
    logger.log({ level: 'error', message: `Error retrieving callback transaction: ${error.message}` });
    return null;
  } finally {
    connection.release();
  }
}

export async function getUserInfo(user) {
  let connection = await pool.getConnection();
  try {
    let sql = 'SELECT * FROM users WHERE username = ?';
    let [rows] = await connection.execute(sql, [user]);

    if (rows.length) {
      let userInfo = rows[0];
      delete userInfo.password;
      return userInfo;
    } else {
      return null;
    }
  } catch (error) {
    logger.log({ level: 'error', message: `Error retrieving user information: ${error.message}` });
    return null;
  } finally {
    connection.release();
  }
}

export async function getLatestFive(user) {
  let connection = await pool.getConnection();
  try {
    let sql = 'SELECT * FROM history WHERE username = ? ORDER BY id DESC LIMIT 5';
    let [rows] = await connection.execute(sql, [user]);

    return rows.length ? rows : null;
  } catch (error) {
    logger.log({ level: 'error', message: `Error retrieving latest transactions: ${error.message}` });
    return null;
  } finally {
    connection.release();
  }
}

export async function getLatestFourtyCallback(user) {
  let connection = await pool.getConnection();
  try {
    let sql = 'SELECT * FROM callback WHERE username = ? ORDER BY id DESC LIMIT 40';
    let [rows] = await connection.execute(sql, [user]);

    return rows.length ? rows : null;
  } catch (error) {
    logger.log({ level: 'error', message: `Error retrieving latest callback transactions: ${error.message}` });
    return null;
  } finally {
    connection.release();
  }
}

export async function getLatestFourtyTransactions(user) {
  let connection = await pool.getConnection();
  try {
    let sql = 'SELECT * FROM history WHERE username = ? ORDER BY id DESC LIMIT 40';
    let [rows] = await connection.execute(sql, [user]);

    return rows.length ? rows : null;
  } catch (error) {
    logger.log({ level: 'error', message: `Error retrieving latest transactions: ${error.message}` });
    return null;
  } finally {
    connection.release();
  }
}

export async function createHistory(username, type, amount, tx_hash, address, ticket) {
  const connection = await pool.getConnection();
  try {
    const sql = 'INSERT INTO history (username, type, amount, tx_hash, address, ticket) VALUES (?, ?, ?, ?, ?, ?)';
    const [result] = await connection.execute(sql, [username, type, amount, tx_hash, address, ticket]);
    logger.log({ level: 'info', message: `The address ${address} has been registered` });
    return result.insertId;
  } catch (error) {
    logger.log({ level: 'error', message: `History creation error: ${error.message}` });
  } finally {
    connection.release();
  }
}
