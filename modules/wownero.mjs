/*
** EPITECH PROJECT, 2024
** wownero.mjs
** File description:
** Module for handling Wownero transfer requests
*/
import axios from 'axios';

export async function wowTransfer(amount, destination) {
    const data = {
        jsonrpc: "2.0",
        id: "0",
        method: "transfer",
        params: {
          destinations: [
            {
              amount: amount,
              address: destination
            }
          ],
          account_index: 0,
          subaddr_indices: [0],
          priority: 0,
          ring_size: 7,
          get_tx_key: true
        }
      };
      
      axios.post('http://127.0.0.1:18082/json_rpc', data, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        console.log('Response:', response.data);
        return response.data.result;
      })
      .catch(error => {
        console.error('Error:', error);
        return {error: error.response?.data || error.message};
      });
}