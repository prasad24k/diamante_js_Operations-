const { Client } = require('pg');
const {
  Asset,
  Aurora,
  BASE_FEE,
  Keypair,
  Networks,
  Operation,
  Server,
  TransactionBuilder,
} = require("diamnet-sdk");
const axios = require("axios");
const secret = "SCP23KPPQXESFYGA3K473AKDFIICQ2EC5XDLMFGQS5LVNIO3FRFXGHE3";

async function getSecretsFromDB() {
  const client = new Client({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'postgres',
    password: 'admin',
    port: 5432,
  });

  await client.connect();

  const res = await client.query('SELECT id, parentacpub FROM public.private_keys ORDER BY id ASC');
  await client.end();

  return res.rows.map(row => row.parentacpub);
}

async function activateAndFundAccounts(secret, destinationPublicKeys) {
  const server = new Aurora.Server("https://mainnet.diamcircle.io/");
  const sourceKeypair = Keypair.fromSecret(secret);
  const account = await server.loadAccount(sourceKeypair.publicKey());
  if (!account) {
    throw new Error("Source account not found");
  }

  // Create a transaction builder
  const transactionBuilder = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: "Diamante MainNet; SEP 2022",
  });

  // Add createAccount operations for each public key
  destinationPublicKeys.forEach(destinationPublicKey => {
    transactionBuilder.addOperation(
      Operation.createAccount({
        destination: destinationPublicKey,
        startingBalance: "0.1",
      })
    );
  });

  // Build and sign the transaction
  const transaction = transactionBuilder.setTimeout(30).build();
  transaction.sign(sourceKeypair);

  try {
    const response = await server.submitTransaction(transaction);
    if (response.successful) {
      console.log("Batch account creation successful..........");
    }
  } catch (error) {
    console.error(" account aredy  created:");
  }
}

(async () => {
  const publicKeys = await getSecretsFromDB();
  await activateAndFundAccounts(secret, publicKeys);
})();
