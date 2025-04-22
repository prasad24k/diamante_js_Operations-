const axios = require('axios');

// Target address to monitor transactions
const targetAddress = 'GBWDTNMCG7RNB2LBFGX4DMRLQNI4KQMQQ37JKFNG75C6AEEC66IJAD6M';

// Diamante Testnet API endpoint to fetch transaction history
const API_URL = 'https://diamtestnet.diamcircle.io/transactions/';

// Function to monitor transactions on the target address
const monitorTransactions = async () => {
  try {
    // Fetch the transaction history for the target address
    const response = await axios.get(`${API_URL}${targetAddress}`);
    const transactions = response.data;

    // Check if there are transactions
    if (transactions && transactions.length > 0) {
      transactions.forEach(transaction => {
        // Filter for 'manage_sell_offer' operations
        transaction.operations.forEach(operation => {
          if (operation.type === 'manage_sell_offer') {
            console.log('Manage Sell Offer Operation:');
            console.log(`Source Account: ${transaction.source_account}`);
            console.log(`Selling Asset: ${operation.selling_asset_code}`);
            console.log(`Buying Asset: ${operation.buying_asset_code}`);
            console.log(`Offer Price: ${operation.offer_price}`);
            console.log(`Offer Amount: ${operation.offer_amount}`);
            console.log(`Transaction Hash: ${transaction.hash}`);
            console.log('--------------------------------------');
          }
        });
      });
    } else {
      console.log('No transactions found for this address.');
    }
  } catch (error) {
    console.error('Error fetching transactions:');
  }
};

// Continuously monitor transactions every 10 seconds
setInterval(monitorTransactions, 10000); // Monitor every 10 seconds
