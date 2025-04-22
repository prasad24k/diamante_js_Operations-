const { Aurora, Keypair } = require('diamnet-sdk');

const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");

async function getAccountSequenceNumber(sourceAccount) {
  try {
    const accountInfo = await server.loadAccount(sourceAccount);
    const sequenceNumber = accountInfo.sequenceNumber();

    console.log(`Sequence number for account ${sourceAccount}: ${sequenceNumber}`);
    return sequenceNumber;
  } catch (error) {
    console.error('Error fetching account details:', error);
    throw error;
  }
}

const sourceAccount = '';
getAccountSequenceNumber(sourceAccount);
