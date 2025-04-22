const {
  Asset,
  Aurora,
  BASE_FEE,
  Keypair,
  Operation,
  TransactionBuilder,
} = require("diamnet-sdk");

const secret = "SBNSPB4X3YHFYSXOPLBXY4D63HUJ7X73PZKPAPTNYT5SSGAC56VLGJZU"; // Issuer's secret key
const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");
const networkPassphrase = "Diamante Testnet 2024";
// Keypairs for the issuer and trustor
const sourceKeypair = Keypair.fromSecret(secret); // Issuer's Keypair
const trustorKeypair = Keypair.random(); // Trustor's Keypair

// Asset details
const assetCode = "WSI";
const AssetIssuer = sourceKeypair.publicKey(); // Issuer's public key
const asset = new Asset(assetCode, AssetIssuer); 

// Create and fund the trustor account
async function createAndFundTrustor() {
  const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());

  const transaction = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase,
  })
    .addOperation(
      Operation.createAccount({
        destination: trustorKeypair.publicKey(),
        startingBalance: "5", 
      })
    )
    .setTimeout(30)
    .build();
  transaction.sign(sourceKeypair);
  try {
    const response = await server.submitTransaction(transaction);
    console.log("Trustor account created and funded:");
  } catch (err) {
    console.error("Transaction failed:", err.response?.data || err.message);
  }
}

// Function to establish a trustline between trustor and asset
async function establishTrustLine() {
  const trustorAccount = await server.loadAccount(trustorKeypair.publicKey());

  const transaction = new TransactionBuilder(trustorAccount, {
    fee: BASE_FEE,
    networkPassphrase,
  })
    .addOperation(
      Operation.changeTrust({
        asset: asset, // The asset that trustor trusts
        limit: "1000", // Trust limit
      })
    )
    .setTimeout(30)
    .build();
  transaction.sign(trustorKeypair);
  try {
    const response = await server.submitTransaction(transaction);
    console.log("Trustline established:");
  } catch (err) {
    console.error("Trustline establishment failed:", err.response?.data || err.message);
  }
}

// Function to perform Allow Trust operation
async function allowTrustOperation() {
  const issuerAccount = await server.loadAccount(sourceKeypair.publicKey()); 

  const transaction = new TransactionBuilder(issuerAccount, {
    fee: BASE_FEE,
    networkPassphrase,
  })
    .addOperation(
      Operation.allowTrust({
        trustor: trustorKeypair.publicKey(),
        assetCode: assetCode,
        authorize: true, // Set to true for full authorization
      })
    )
    .setTimeout(30)
    .build();
  transaction.sign(sourceKeypair); 
  try {
    const response = await server.submitTransaction(transaction);
    console.log("AllowTrust operation successful:");
  } catch (err) {
    console.error("AllowTrust Transaction failed:", err.response?.data || err.message);
  }
}

// Function to perform Set Trustline Flags operation
async function setTrustLineFlagsOperation() {
  const issuerAccount = await server.loadAccount(sourceKeypair.publicKey());

  const transaction = new TransactionBuilder(issuerAccount, {
    fee: BASE_FEE,
    networkPassphrase,
  })
    .addOperation(
      Operation.setTrustLineFlags({
        trustor: trustorKeypair.publicKey(),
        asset: asset,
        flags: {
          authorized: true,
          authorizedToMaintainLiabilities: false,
          clawbackEnabled: false
        }
      })
    )
    .setTimeout(30)
    .build();

  // Sign and submit the transaction
  transaction.sign(sourceKeypair);
  try {
    const response = await server.submitTransaction(transaction);
    console.log("Set Trustline Flags operation successful:");
  } catch (err) {
    console.error("Set Trustline Flags Transaction failed:", err.response?.data || err.message);
  }
}

// Main function to run the steps
async function main() {
  await createAndFundTrustor(); // Create and fund the trustor account
  await establishTrustLine();   // Trustor establishes a trustline for the asset
  await allowTrustOperation();  // Allow the trustline from issuer's side
  await setTrustLineFlagsOperation(); // Set the trustline flags on the asset
}

main().catch(console.error);