// Import required modules from the Diamante SDK
const {
  Asset,
  Aurora,
  BASE_FEE,
  Keypair,
  Networks,
  Operation,
  TransactionBuilder,
} = require("diamnet-sdk");

// The secret key for the source account 
const secret = "SBGA577N4YRL5OK4ED3ADPDHMLYZ6EYMJWTTZLM7RKPR64QMRUQEP7LN";

// Initialize the Diamante testnet server
const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");

// Generate the source account keypair and retrieve its public key
const sourceKeypair = Keypair.fromSecret(secret);
const sourcePublicKey = sourceKeypair.publicKey();

async function createTrustline(assetCode, assetIssuer) {
  try {
    // Create an Asset object with the given asset code and issuer
    const asset = new Asset(assetCode, assetIssuer);
    console.log("Creating trustline for asset:", assetCode);

    // Load the current state of the source account from the Diamante blockchain
    const account = await server.loadAccount(sourcePublicKey);

    // Build a transaction to create the trustline
    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE, // Set the transaction fee (BASE_FEE is predefined in the SDK)
      networkPassphrase: Networks.TESTNET, // Specify the network passphrase (Diamante testnet in this case)
    })
      .addOperation(Operation.changeTrust({
        asset: asset, // Specify the asset for which the trustline is being created
      }))
      .setTimeout(30) // Set a timeout of 30 seconds for the transaction
      .build();

    // Sign the transaction with the source account's secret key
    transaction.sign(sourceKeypair);

    // Submit the transaction to the Diamante testnet
    const result = await server.submitTransaction(transaction);

    // Log success and return the transaction result
    console.log("Trustline created successfully.");
    return result;
  } catch (error) {
    // Log and rethrow errors encountered during the process
    console.error("Error creating trustline:", error);
    throw error;
  }
}

// Call the createTrustline function with example parameters
createTrustline("CAT", "GBHHU65KNWOSXH3HWPADXMONMIVDH4V4PRXSNBWFKVCEW27HEESJXZIH")
  .then(result => {
    // Log the result of the trustline creation
    console.log("Trustline result:", result);
  })
  .catch(error => {
    // Handle errors that occurred during the trustline creation process
    console.error("Failed to create trustline:", error);
  });
