// Import necessary modules from the Diamnet SDK
const { Aurora, BASE_FEE, Keypair, Operation, TransactionBuilder } = require("diamnet-sdk");

// Secret key of the account that will interact with the liquidity pool
const secret = "SB4EHJXQGD3TDDJJ3MQKL5LZ2JOZSIKTBITFG6VHQ4XPVI42PCBZWBLU";

// Connect to the Diamnet testnet server
const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");

/**
 * Function to withdraw assets from a liquidity pool.
 * 
 * @param {string} liquidityPoolId - The ID of the liquidity pool to withdraw from.
 * @param {string} amount - The number of liquidity pool shares to withdraw.
 * @param {string} minAmountA - The minimum amount of the first asset to receive.
 * @param {string} minAmountB - The minimum amount of the second asset to receive.
 */
async function liquidityPoolWithdraw(liquidityPoolId, amount, minAmountA, minAmountB) {
  // Load the keypair using the secret key
  const keypair = Keypair.fromSecret(secret);
  const publicKey = keypair.publicKey();

  // Fetch the account details from the server
  let questAccount = await server.loadAccount(publicKey);

  // Convert the liquidity pool ID from a string to a Buffer (required for the transaction)
  const liquidityPoolIdBuffer = Buffer.from(liquidityPoolId, 'hex');

  // Create a transaction to withdraw assets from the liquidity pool
  const withdrawTransaction = new TransactionBuilder(questAccount, {
    fee: BASE_FEE, // Set the base fee for the transaction
    networkPassphrase: "Diamante Testnet 2024", // Specify the testnet network
  })
    .addOperation(
      // Add a liquidityPoolWithdraw operation
      Operation.liquidityPoolWithdraw({
        liquidityPoolId: liquidityPoolIdBuffer, // Liquidity pool ID
        amount: amount.toString(), // Number of pool shares to withdraw
        minAmountA: minAmountA.toString(), // Minimum amount of asset A to receive
        minAmountB: minAmountB.toString(), // Minimum amount of asset B to receive
      })
    )
    .setTimeout(30) // Set the transaction timeout to 30 seconds
    .build(); // Build the transaction

  // Sign the transaction with the account's keypair
  withdrawTransaction.sign(keypair);

  try {
    // Submit the transaction to the Diamnet server
    const withdrawResult = await server.submitTransaction(withdrawTransaction);
    console.log("Liquidity withdrawn successfully", withdrawResult.hash);
  } catch (error) {
    // Handle transaction failure and log the error
    console.error("Transaction failed:", error.response.data);
    if (error.response.data.extras && error.response.data.extras.result_codes) {
      console.error("Result Codes:", error.response.data.extras.result_codes);
    }
  }
}

// Call the liquidityPoolWithdraw function to execute the withdrawal
liquidityPoolWithdraw(
  "440027a4a8ce095f9f2c606dde7fd789fd7c2f7e5c1f1f681aef818bef417cac", // Example Pool ID
  "3", // Amount of pool shares to withdraw
  "1", // Minimum amount of the first asset to withdraw
  "1" // Minimum amount of the second asset to withdraw
);
