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
  const parentSecrets = res.rows.slice(41, 50).map(row => ({
    parentSecret: row.parentaccount,
    assetCode: row.assetcode,
    id: row.id
    
  }));

  const distributorSecrets = res.rows.slice(91, 100).map(row => ({
    distributorSecret: row.parentaccount,
    assetCode: row.assetcode,
    id: row.id
  }));

  return {
    parentSecrets,
    distributorSecrets
  };
}

async function changeTrust(server, parentKeypair, assetCode, distributorPublicKey) {
  const parentAccount = await server.loadAccount(parentKeypair.publicKey());
  const _asset = new Asset(assetCode, distributorPublicKey);

  const transaction = new TransactionBuilder(parentAccount, {
    fee: BASE_FEE,
    networkPassphrase:  "Diamante MainNet; SEP 2022",
  })
    .addOperation(Operation.changeTrust({ asset: _asset }))
    .setTimeout(0)
    .build();

  transaction.sign(parentKeypair);
  await server.submitTransaction(transaction);
  //console.log("Trustline created successfully.");
}

async function mintAsset(server, parentKeypair, distributorKeypair, assetCode, supply) {
  const distributorAccount = await server.loadAccount(distributorKeypair.publicKey());
  const _asset = new Asset(assetCode, distributorKeypair.publicKey());

  const transaction = new TransactionBuilder(distributorAccount, {
    fee: BASE_FEE,
    networkPassphrase:  "Diamante MainNet; SEP 2022",
  })
    .addOperation(
      Operation.payment({
        destination: parentKeypair.publicKey(),
        asset: _asset,
        amount: supply,
      })
    )
    .setTimeout(100)
    .build();

  transaction.sign(distributorKeypair);
  await server.submitTransaction(transaction);
  console.log("Asset minted successfully.");
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function mint() {
  try {
    const { parentSecrets, distributorSecrets } = await getSecretsFromDB();
    const server = new Aurora.Server("https://mainnet.diamcircle.io/");

    const minSupply = 100000; // 1 lakh
    const maxSupply = 1000000; // 1 million

    for (let i = 0; i < parentSecrets.length; i++) {
      const parentKeypair = Keypair.fromSecret(parentSecrets[i].parentSecret);
      const distributorKeypair = Keypair.fromSecret(distributorSecrets[i].distributorSecret);
      const assetCode = parentSecrets[i].assetCode;
      const supply = getRandomNumber(minSupply, maxSupply).toString(); // Generate random supply

      await changeTrust(server, parentKeypair, assetCode, distributorKeypair.publicKey());
      await mintAsset(server, parentKeypair, distributorKeypair, assetCode, supply);
      console.log(`ID ${parentSecrets[i].id} asset minted successfully with supply: ${supply}.`);
    }
    console.log("All accounts processed successfully.");
  } catch (error) {
    console.error("Error during minting:", error);
  }
}

mint();
