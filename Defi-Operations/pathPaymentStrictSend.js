// Importing required modules and classes from the Diamnet SDK
const { Asset, Aurora, BASE_FEE, Keypair, Operation, TransactionBuilder } = require("diamnet-sdk");

// Network configuration
const NETWORK_PASSPHRASE = "Diamante Testnet 2024";
const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");

// Function to perform a token swap 
async function swapAssets(secretKey, sendAmount, poolId) {
  // Generate keypair and extract the public key from the provided secret key
  const keypair = Keypair.fromSecret(secretKey);
  const publicKey = keypair.publicKey();

  // Define the native Diam asset and the custom token asset (WOLF)
  const diamAsset = Asset.native();
  const TokenAsset = new Asset(
    "WOLF",
    "GAUOYFQZUERFKOXKUCE2BBVYLR6C6NG2OBCGA4GU6X67C6OJKLFCHY5E"
  );

  // Load the user's account data from the Diamnet server
  const questAccount = await server.loadAccount(publicKey);

  // Check if the user has an existing trustline for the token asset
  const accountLines = await server.loadAccount(publicKey);
  let hasTrustline = false;
  for (let line of accountLines.balances) {
    if (
      line.asset_code === TokenAsset.code &&
      line.asset_issuer === TokenAsset.issuer
    ) {
      hasTrustline = true;
      break;
    }
  }

  // If the trustline does not exist, create one
  if (!hasTrustline) {
    const trustTransaction = new TransactionBuilder(questAccount, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        Operation.changeTrust({
          asset: TokenAsset,
        })
      )
      .setTimeout(0)
      .build();

    // Sign and submit the trustline transaction
    trustTransaction.sign(keypair);
    await server.submitTransaction(trustTransaction);
    console.log("Trustline created successfully");
  }

  // Fetch liquidity pool details using the provided pool ID
  const pool = await server
    .liquidityPools()
    .liquidityPoolId(poolId)
    .call();

  // Extract reserves from the liquidity pool
  const reserveA = parseFloat(pool.reserves[0].amount); // DIAM reserve
  const reserveB = parseFloat(pool.reserves[1].amount); // WOLF reserve

  // Calculate the amount of tokens (WOLF) to be received based on the DIAM sent
  const swappedAmount = (sendAmount * reserveB) / (reserveA + sendAmount);
  const minToken = (swappedAmount * 0.98).toFixed(7); // Apply a 98% buffer for minimum received amount

  // Build the transaction for the swap operation
  const transaction = new TransactionBuilder(questAccount, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.pathPaymentStrictSend({
        sendAsset: diamAsset,
        sendAmount: sendAmount.toFixed(7), // Amount of DIAM to send
        destination: publicKey, // Destination is the sender's own account
        destAsset: TokenAsset, // Token to receive
        destMin: minToken, // Minimum token amount to receive (buffer applied)
        path: [diamAsset], // Path of the swap
      })
    )
    .setTimeout(0)
    .build();

  // Sign the transaction
  transaction.sign(keypair);

  // Submit the transaction to the Diamnet server
  try {
    const result = await server.submitTransaction(transaction);
    console.log("Swap successful:", result.hash);
    return { success: true, hash: result.hash }; // Return success and transaction hash
  } catch (error) {
    console.error("Swap failed:", error);
    return { success: false, error: error.message }; // Return failure and error message
  }
}

// Example usage of the swapAssets function
(async () => {
  const secretKey = "SBP3FOMXTZLF5ESD4D4QNYYMKRDHM4UWK75UEICJKBIOTZ6HJSDJFSZ6"; // Replace with the user's secret key
  const sendAmount = 5; // Amount of DIAM to send
  const poolId = "440027a4a8ce095f9f2c606dde7fd789fd7c2f7e5c1f1f681aef818bef417cac"; // Pool ID

  const result = await swapAssets(secretKey, sendAmount, poolId);
  if (result.success) {
    console.log("Swap successful:", result.hash);
  } else {
    console.error("Swap failed:", result.error);
  }
})();
