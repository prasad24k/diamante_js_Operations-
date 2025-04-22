const { Asset, Aurora, BASE_FEE, Keypair, Operation, TransactionBuilder } = require("diamnet-sdk");
const { Client } = require('pg');

async function getSecretsFromDB() {
  const client = new Client({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'postgres',
    password: 'admin',
    port: 5432,
  });

  await client.connect();

  // Fetch the data ordered by id
  const res = await client.query('SELECT ParentAccount, assetcode, id FROM Private_keys ORDER BY id ASC');
  await client.end();

  if (res.rows.length < 100) {
    throw new Error('Insufficient data found in the database');
  }

  // Transform the data into the desired format
  const parentSecrets = res.rows.slice(14, 50).map(row => ({
    parentSecret: row.parentaccount,
    assetCode: row.assetcode,
    id: row.id
  }));

  const distributorSecrets = res.rows.slice(64, 100).map(row => ({
    distributorSecret: row.parentaccount,
    assetCode: row.assetcode,
    id: row.id
  }));

  return {
    parentSecrets,
    distributorSecrets
  };
}

function createChangeTrustOperation(parentKeypair, assetCode, distributorPublicKey) {
  const _asset = new Asset(assetCode, distributorPublicKey);
  return Operation.changeTrust({ asset: _asset });
}

function createMintAssetOperation(parentKeypair, distributorKeypair, assetCode, supply) {
  const _asset = new Asset(assetCode, distributorKeypair.publicKey());
  return Operation.payment({
    destination: parentKeypair.publicKey(),
    asset: _asset,
    amount: supply,
  });
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function mint() {
  try {
    const { parentSecrets, distributorSecrets } = await getSecretsFromDB();
    const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");

    const minSupply = 100000; // 1 lakh
    const maxSupply = 1000000; // 1 million

    const operations = [];

    for (let i = 0; i < parentSecrets.length; i++) {
      const parentKeypair = Keypair.fromSecret(parentSecrets[i].parentSecret);
      const distributorKeypair = Keypair.fromSecret(distributorSecrets[i].distributorSecret);
      const assetCode = parentSecrets[i].assetCode;
      const supply = getRandomNumber(minSupply, maxSupply).toString(); // Generate random supply

      const changeTrustOp = createChangeTrustOperation(parentKeypair, assetCode, distributorKeypair.publicKey());
      const mintAssetOp = createMintAssetOperation(parentKeypair, distributorKeypair, assetCode, supply);

      operations.push(changeTrustOp, mintAssetOp);
    }

    const parentAccount = await server.loadAccount(parentSecrets[0].parentSecret);
    const transaction = new TransactionBuilder(parentAccount, {
      fee: BASE_FEE,
      networkPassphrase: "Diamante Testnet 2024",
    });

    operations.forEach(op => transaction.addOperation(op));

    transaction.setTimeout(100).build();

    parentSecrets.forEach(parentSecret => {
      const parentKeypair = Keypair.fromSecret(parentSecret.parentSecret);
      transaction.sign(parentKeypair);
    });

    distributorSecrets.forEach(distributorSecret => {
      const distributorKeypair = Keypair.fromSecret(distributorSecret.distributorSecret);
      transaction.sign(distributorKeypair);
    });

    await server.submitTransaction(transaction);
    console.log("Batch transaction submitted successfully.");
  } catch (error) {
    console.error("Error during minting:", error);
  }
}

mint();
