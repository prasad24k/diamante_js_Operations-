const { Asset, Aurora, BASE_FEE, Keypair, Operation, TransactionBuilder } = require("diamnet-sdk");

const NETWORK_PASSPHRASE = "Diamante Testnet 2024";
const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");

async function pathPaymentStrictReceive(secretKey, receiveAmount, poolId) {
  const keypair = Keypair.fromSecret(secretKey);
  const publicKey = keypair.publicKey();

  // Define assets
  const diamAsset = Asset.native(); // DIAM (native asset)
  const NewToken = new Asset(
    "WOLF",
    "GAUOYFQZUERFKOXKUCE2BBVYLR6C6NG2OBCGA4GU6X67C6OJKLFCHY5E"
  );

  // Load the sender's account details
  const questAccount = await server.loadAccount(publicKey);

  // Check if the account has a trustline for the destination token
  const accountLines = await server.loadAccount(publicKey);
  let hasTrustline = false;
  for (let line of accountLines.balances) {
    if (
      line.asset_code === NewToken.code &&
      line.asset_issuer === NewToken.issuer
    ) {
      hasTrustline = true;
      break;
    }
  }

  // If no trustline exists, create it
  if (!hasTrustline) {
    const trustTransaction = new TransactionBuilder(questAccount, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        Operation.changeTrust({
          asset: NewToken, // Destination token
        })
      )
      .setTimeout(0)
      .build();

    trustTransaction.sign(keypair);
    await server.submitTransaction(trustTransaction);
    console.log("Trustline created successfully");
  }

  try {
    // Fetch liquidity pool details
    const pool = await server.liquidityPools().liquidityPoolId(poolId).call();

    // Extract reserves for DIAM and the token
    const reserveA = parseFloat(pool.reserves[0].amount); // DIAM reserve
    const reserveB = parseFloat(pool.reserves[1].amount); // WOLF token reserve

    // Calculate the amount of DIAM required to receive the specified amount of the token
    const sendAmount = (receiveAmount * reserveA) / (reserveB - receiveAmount);
    const maxSend = (sendAmount * 1.02).toFixed(7); // Add a 2% buffer
    // Create the transaction for path payment
    const transaction = new TransactionBuilder(questAccount, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        Operation.pathPaymentStrictReceive({
          sendAsset: diamAsset, // Asset to send
          sendMax: maxSend, // Maximum amount to send (with buffer)
          destination: publicKey, // Destination account
          destAsset: NewToken, // Asset to receive
          destAmount: receiveAmount.toFixed(7), // Exact amount to receive
          path: [diamAsset], // Payment path (in this case, direct)
        })
      )
      .setTimeout(0)
      .build();

    // Sign and submit the transaction
    transaction.sign(keypair);

    const result = await server.submitTransaction(transaction);
    return { success: true, hash: result.hash };
  } catch (error) {
    console.error("Error fetching liquidity pool or submitting transaction:", error);
    if (error.response && error.response.data) {
      console.error("Response Data:", error.response.data);
    }
    return { success: false, error: error.message };
  }
}

// Example usage of the function
(async () => {
  const secretKey = "SB4EHJXQGD3TDDJJ3MQKL5LZ2JOZSIKTBITFG6VHQ4XPVI42PCBZWBLU"; // Replace with the user's secret key
  const receiveAmount = 1; // Amount of the token to receive
  const poolId = "440027a4a8ce095f9f2c606dde7fd789fd7c2f7e5c1f1f681aef818bef417cac"; // Pool ID for the swap

  const result = await pathPaymentStrictReceive(secretKey, receiveAmount, poolId);
  if (result.success) {
    console.log("Swap successful with hash:", result.hash);
  } else {
    console.error("Swap failed:", result.error);
  }
})();
