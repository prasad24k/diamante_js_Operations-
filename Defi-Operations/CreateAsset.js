// Import required modules from the Diamante SDK
const {
  Asset,
  Aurora,
  BASE_FEE,
  Keypair,
  Operation,
  TransactionBuilder,
} = require("diamnet-sdk");

// The secret key of the issuing account (should be stored securely in production)
const secret = "SCKUHEXER4BVKG5MVA4MTRYW5DLOHE5DFBBA75KS7C4DK245EIIN5EIZ";

/**
 * Function to create a distributor account.
 * The distributor account is used to handle and distribute the minted tokens.
 *
 * @param {Keypair} parentKeypair - The issuing account's keypair.
 * @param {Aurora.Server} server - The Aurora server instance.
 * @returns {Keypair} - The newly created distributor account's keypair.
 */
async function createAccount(parentKeypair, server) {
  const parentPublicKey = parentKeypair.publicKey();

  // Load the issuing account from the blockchain
  const parentAccount = await server.loadAccount(parentPublicKey);

  // Check if the issuing account has sufficient balance to create the distributor account
  const nativeBalance = parentAccount.balances.find(
    (item) => item.asset_type === "native"
  );
  if (
    parseFloat(nativeBalance.balance) <
    parentAccount.subentry_count * 1 + 2 + 2.01 + 0.00001
  ) {
    console.log("Insufficient balance to create account");
    return;
  }

  // Generate a random keypair for the distributor account
  const distributorKeypair = Keypair.random();
  const distributorPublicKey = distributorKeypair.publicKey();
  console.log("Creating your distributor account:", distributorPublicKey);

  // Create a transaction to fund the distributor account
  const createAccountTx = new TransactionBuilder(parentAccount, {
    fee: BASE_FEE,
    networkPassphrase: "Diamante Testnet 2024",
  })
    .addOperation(
      Operation.createAccount({
        destination: distributorPublicKey,
        startingBalance: "2", // Minimum starting balance required
      })
    )
    .setTimeout(0)
    .build();

  // Sign the transaction and submit it to the network
  createAccountTx.sign(parentKeypair);
  const createAccountResponse = await server.submitTransaction(createAccountTx);
  console.log("Distributor account created successfully.");

  return distributorKeypair;
}

/**
 * Function to establish a trustline for the asset.
 * A trustline allows the parent account to hold and manage the asset.
 *
 * @param {Keypair} parentKeypair - The issuing account's keypair.
 * @param {string} assetCode - The asset code (e.g., "ARET").
 * @param {string} distributorPublicKey - The public key of the distributor account.
 * @param {Aurora.Server} server - The Aurora server instance.
 */
async function changeTrust(parentKeypair, assetCode, distributorPublicKey, server) {
  const parentPublicKey = parentKeypair.publicKey();

  // Load the issuing account
  const parentAccount = await server.loadAccount(parentPublicKey);

  // Check if the account has sufficient balance for the trustline creation
  const nativeBalance = parentAccount.balances.find(
    (item) => item.asset_type === "native"
  );
  if (
    parseFloat(nativeBalance.balance) <
    nativeBalance.subentry_count * 1 + 2 + 1 + 0.00001
  ) {
    console.log("Insufficient balance to create trustline");
    return;
  }

  // Create a trustline transaction
  const trustlineTx = new TransactionBuilder(parentAccount, {
    fee: BASE_FEE,
    networkPassphrase: "Diamante Testnet 2024",
  })
    .addOperation(
      Operation.changeTrust({
        asset: new Asset(assetCode, distributorPublicKey),
      })
    )
    .setTimeout(0)
    .build();

  // Sign and submit the transaction
  trustlineTx.sign(parentKeypair);
  const trustlineResponse = await server.submitTransaction(trustlineTx);
  console.log("Trustline created successfully.");
}

/**
 * Function to mint new tokens and transfer them to the parent account.
 *
 * @param {Keypair} parentKeypair - The issuing account's keypair.
 * @param {Keypair} distributorKeypair - The distributor account's keypair.
 * @param {string} assetCode - The asset code (e.g., "ARET").
 * @param {string} supply - The total supply of tokens to be minted.
 * @param {Aurora.Server} server - The Aurora server instance.
 */
async function mintAsset(parentKeypair, distributorKeypair, assetCode, supply, server) {
  const parentPublicKey = parentKeypair.publicKey();
  const distributorPublicKey = distributorKeypair.publicKey();

  // Load the distributor account
  const distributorAccount = await server.loadAccount(distributorPublicKey);

  // Create a payment transaction to transfer the minted tokens
  const paymentTx = new TransactionBuilder(distributorAccount, {
    fee: BASE_FEE,
    networkPassphrase: "Diamante Testnet 2024",
  })
    .addOperation(
      Operation.payment({
        destination: parentPublicKey,
        asset: new Asset(assetCode, distributorPublicKey),
        amount: supply, // Total supply of the tokens
      })
    )
    .setTimeout(100)
    .build();

  // Sign and submit the payment transaction
  paymentTx.sign(distributorKeypair);
  const paymentResponse = await server.submitTransaction(paymentTx);
  console.log("Asset minted successfully.");

  // Set the master key weight for the distributor account
  await setMasterKeyWeight(distributorAccount, distributorKeypair, server);
}

/**
 * Function to set the master key weight for an account.
 * Used to restrict access and secure the distributor account.
 *
 * @param {Object} account - The account object of the distributor.
 * @param {Keypair} keypair - The distributor account's keypair.
 * @param {Aurora.Server} server - The Aurora server instance.
 */
async function setMasterKeyWeight(account, keypair, server) {
  const setOptionsTx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: "Diamante Testnet 2024",
  })
    .addOperation(
      Operation.setOptions({
        masterWeight: 1, // Reduce the master key weight
      })
    )
    .setTimeout(0)
    .build();

  // Sign and submit the transaction
  setOptionsTx.sign(keypair);
  const setOptionsResponse = await server.submitTransaction(setOptionsTx);
  console.log("Master key weight set successfully.");
}

/**
 * Main function to mint a token and set up the accounts.
 */
async function mint() {
  const assetCode = "ARET"; // Asset code for the token
  const supply = "100000"; // Total supply of the token
  const parentKeypair = Keypair.fromSecret(secret);
  const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");

  // Create the distributor account
  const distributorKeypair = await createAccount(parentKeypair, server);
  const distributorPublicKey = distributorKeypair.publicKey();

  // Establish trustline and mint the token
  await changeTrust(parentKeypair, assetCode, distributorPublicKey, server);
  await mintAsset(parentKeypair, distributorKeypair, assetCode, supply, server);
}

// Execute the mint function
(async () => {
  await mint();
})();

// Link to check the token details: https://diamtestnet.diamcircle.io/accounts/{PUBLICKEY}
