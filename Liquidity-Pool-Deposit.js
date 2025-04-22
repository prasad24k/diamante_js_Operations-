const { formToJSON } = require("axios");
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

const secret = "SAG4XF6ZBNRHRR62XIZ6YBB55FETWMRLSUCSQRKXWWNVRX6IFQG4XEQV";


const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");

//Createing Liquidity Pool ID and deposit Token Pair 
async function addLiquidity() {
  const keypair = Keypair.fromSecret(secret);
  console.log()
  const publicKey = keypair.publicKey();

  let questAccount = await server.loadAccount(publicKey);
  const tokenAsset = new Asset("AnuToken", "GCKEIJ5JNZMNOAB2JJQRF3CDKQU76KT2R4W7M7XX5BD3EDMOKSQBYOZY");
  const balances = questAccount.balances;
  balances.forEach(function (balance) {
    if (balance.asset_type === 'native') {
      console.log("Diam Balance:" + balance.balance);
    } else if (balance.asset_code === 'AnuToken') {
      console.log("Token Balance:" + balance.balance);
    }
  });

  const lpAsset = new LiquidityPoolAsset(
    Asset.native(),
    tokenAsset,
    30 // fee parameter for the pool (0.3%)
  );
  const liquidityPoolId = getLiquidityPoolId(
    "constant_product",
    lpAsset
  ).toString("hex");
  console.log("Your pool ID:", liquidityPoolId);
  // Convert liquidityPoolId to Buffer
  const liquidityPoolIdBuffer = Buffer.from(liquidityPoolId, 'hex');

  //Establish trust line for liquidity pool asset
  //This operation is used to establish a trust line for a specific asset. In this case, it's used to establish a trust line for the liquidity pool asset.
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
  trustTransaction.sign(keypair);
    const trustResult = await server.submitTransaction(trustTransaction);
    console.log("Trust line established successfully", trustResult.hash);
  questAccount = await server.loadAccount(publicKey);
  const depositTransaction = new TransactionBuilder(questAccount, {
    fee: BASE_FEE,
    networkPassphrase: "Diamante Testnet 2024",
  })
  //This operation is used to deposit assets into a liquidity pool. It requires specifying the liquidity pool ID, the maximum amounts of the two assets to deposit, and the minimum and maximum price ratios of the assets.
    .addOperation(
      Operation.liquidityPoolDeposit({
        liquidityPoolId: liquidityPoolIdBuffer,
        maxAmountA: "10", // DIAM
        maxAmountB: "20", // WOLF token
        minPrice: { n: 1, d: 2 }, // Min price ratio of Token to Diam
        maxPrice: { n: 1, d:1  }, // Max price ratio of Token to Diam
      })
    )
    .setTimeout(30)
    .build();

  depositTransaction.sign(keypair);
    const depositResult = await server.submitTransaction(depositTransaction);
    console.log("Liquidity provided successfully", depositResult.hash);
  }

  //This operation is used to withdraw assets from a liquidity pool. It requires specifying the liquidity pool ID, the amount of pool shares to withdraw, and the minimum amounts of the two assets to withdraw.
  async function liquidityPoolWithdraw(liquidityPoolId, amount, minAmountA, minAmountB) {
    const keypair = Keypair.fromSecret(secret);
    const publicKey = keypair.publicKey();
  
    let questAccount = await server.loadAccount(publicKey);
  
    // Convert liquidityPoolId to Buffer
    const liquidityPoolIdBuffer = Buffer.from(liquidityPoolId, 'hex');
  
    const withdrawTransaction = new TransactionBuilder(questAccount, {
      fee: BASE_FEE,
      networkPassphrase: "Diamante Testnet 2024",
    })
    
      .addOperation(
        Operation.liquidityPoolWithdraw({
          liquidityPoolId: liquidityPoolIdBuffer,
          amount: amount.toString(),
          minAmountA: minAmountA.toString(),
          minAmountB: minAmountB.toString(),
        })
      )
      .setTimeout(30)
      .build();
  
    withdrawTransaction.sign(keypair);
    const withdrawResult = await server.submitTransaction(withdrawTransaction);
    console.log("Liquidity withdrawn successfully", withdrawResult.hash);
  }
addLiquidity()
// liquidityPoolWithdraw(
//   "a6fd5f994a3fc278ab6d8a5242a3611228b04688d34927493c68a4d9652fed46", //Your Pool Id 
//   "10", // Amount of pool shares to withdraw
//   "5", // Minimum amount of the first asset to withdraw
//   "5" // Minimum amount of the second asset to withdraw
// );



/*
Purpose ->>>>
Load Account: Loads the account associated with the provided secret key.
Check Balances: Prints the balances of Diam (native asset) and WOLF (custom asset) for the account.
Create Liquidity Pool Asset: Defines the liquidity pool asset using Diam and WOLF with a fee parameter of 0.3%.
Get Liquidity Pool ID: Generates the liquidity pool ID based on the asset pair and fee parameter.
Establish Trust Line: Creates and submits a transaction to establish a trust line for the liquidity pool asset.
Deposit Assets: Creates and submits a transaction to deposit Diam and WOLF into the liquidity pool.
 */


//You can check the liquidity pool https://diamtestnet.diamcircle.io/liquidity_pools?limit=10