const {
  Asset,
  Aurora,
  BASE_FEE,
  Keypair,
  Operation,
  TransactionBuilder,
  LiquidityPoolAsset,
  getLiquidityPoolId,
} = require("diamnet-sdk");

const secret = "SB4EHJXQGD3TDDJJ3MQKL5LZ2JOZSIKTBITFG6VHQ4XPVI42PCBZWBLU";

// Initialize Diamante testnet server
const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");

// Main function to add liquidity to a liquidity pool
async function addLiquidity() {
  // Load the keypair and public key for the account
  const keypair = Keypair.fromSecret(secret);
  const publicKey = keypair.publicKey();

  // Load the account details from the Diamante testnet
  let questAccount = await server.loadAccount(publicKey);

  // Define the token asset (e.g., WOLF token)
  const tokenAsset = new Asset(
    "WOLF",
    "GAUOYFQZUERFKOXKUCE2BBVYLR6C6NG2OBCGA4GU6X67C6OJKLFCHY5E"
  );

  // Display account balances for Diam (native asset) and WOLF token
  const balances = questAccount.balances;
  balances.forEach(function (balance) {
    if (balance.asset_type === "native") {
      console.log("Diam Balance:", balance.balance);
    } else if (balance.asset_code === "WOLF") {
      console.log("Token Balance:", balance.balance);
    }
  });

  // Create the liquidity pool asset (constant product type) with Diam and WOLF token
  const lpAsset = new LiquidityPoolAsset(
    Asset.native(),
    tokenAsset,
    30 // Fee parameter for the pool (0.3%)
  );

  // Generate the liquidity pool ID based on the asset pair and fee
  const liquidityPoolId = getLiquidityPoolId(
    "constant_product",
    lpAsset
  ).toString("hex");
  console.log("Your pool ID:", liquidityPoolId);

  // Convert the liquidity pool ID to a buffer for use in transactions
  const liquidityPoolIdBuffer = Buffer.from(liquidityPoolId, "hex");

  // Step 1: Establish a trustline for the liquidity pool asset
  const trustTransaction = new TransactionBuilder(questAccount, {
    fee: BASE_FEE,
    networkPassphrase: "Diamante Testnet 2024",
  })
    .addOperation(
      Operation.changeTrust({
        asset: lpAsset,
      })
    )
    .setTimeout(30)
    .build();

  // Sign and submit the trustline transaction
  trustTransaction.sign(keypair);
  const trustResult = await server.submitTransaction(trustTransaction);
  console.log("Trust line established successfully:", trustResult.hash);

  // Reload the account to fetch updated information
  questAccount = await server.loadAccount(publicKey);

  // Step 2: Deposit assets into the liquidity pool
  const depositTransaction = new TransactionBuilder(questAccount, {
    fee: BASE_FEE,
    networkPassphrase: "Diamante Testnet 2024",
  })
    .addOperation(
      Operation.liquidityPoolDeposit({
        liquidityPoolId: liquidityPoolIdBuffer, // Liquidity pool ID
        maxAmountA: "10", // Maximum amount of Diam to deposit
        maxAmountB: "20", // Maximum amount of WOLF token to deposit
        minPrice: { n: 1, d: 2 }, // Minimum price ratio of Token to Diam (1/2)
        maxPrice: { n: 1, d: 1 }, // Maximum price ratio of Token to Diam (1/1)
      })
    )
    .setTimeout(30)
    .build();

  // Sign and submit the deposit transaction
  depositTransaction.sign(keypair);
  const depositResult = await server.submitTransaction(depositTransaction);
  console.log("Liquidity provided successfully:", depositResult.hash);
}

// Run the function to add liquidity
addLiquidity();

/*
Purpose ->>>>
1. **Load Account**: Loads the account associated with the provided secret key.
2. **Check Balances**: Displays balances of Diam (native asset) and WOLF (custom token) for the account.
3. **Create Liquidity Pool Asset**: Defines the liquidity pool asset using Diam and WOLF, with a fee parameter of 0.3%.
4. **Get Liquidity Pool ID**: Generates the unique ID for the liquidity pool based on the asset pair and fee.
5. **Establish Trustline**: Creates and submits a transaction to establish a trustline for the liquidity pool asset.
6. **Deposit Assets**: Deposits Diam and WOLF into the liquidity pool with specified maximum amounts and price ratios.
*/

// You can check the liquidity pool at:
// https://diamtestnet.diamcircle.io/liquidity_pools?limit=10
