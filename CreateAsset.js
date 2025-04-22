const {
  Asset,
  Aurora,
  BASE_FEE,
  Keypair,
  Operation,
  TransactionBuilder,
} = require("diamnet-sdk");

const secret = "SAG4XF6ZBNRHRR62XIZ6YBB55FETWMRLSUCSQRKXWWNVRX6IFQG4XEQV";

//Create Account 
/*This account is responsible for defining the properties of the token,
such as its asset code and any additional metadata. The issuing account
holds the authority to mint new tokens and control their supply.*/
async function createAccount(parentKeypair, server) {
  const parentPublicKey = parentKeypair.publicKey();
  const parentAccount = await server.loadAccount(parentPublicKey);
  const nativeBalance = parentAccount.balances.find(
    (item) => item.asset_type === "native"
  );
  if (
    parseFloat(nativeBalance.balance) <
    parentAccount.subentry_count * 1 + 2 + 2.01 + 0.00001
  ) {
    console.log("insufficient balance to create account");
    return;
  }
  // generate random keypair for the distributor account
  const distributorKeypair = Keypair.random();
  const distributorPublicKey = distributorKeypair.publicKey();
  console.log("creating your distributor account done", distributorPublicKey);
  // fund the distributor account with the minimum balance required
  const createAccountTx = new TransactionBuilder(parentAccount, {
    fee: BASE_FEE,
    networkPassphrase: "Diamante Testnet 2024",
  })
    .addOperation(
      Operation.createAccount({
        destination: distributorPublicKey,
        startingBalance: "0.1",
      })
    )
    .setTimeout(0)
    .build();
  createAccountTx.sign(parentKeypair);
  const createAccountResponse = await server.submitTransaction(createAccountTx);
  console.log("create account response okk");

  return distributorKeypair;
}

//change trust
async function changeTrust(
  parentKeypair,
  assetCode,
  distributorPublicKey,
  server
) {
  const parentPublicKey = parentKeypair.publicKey();
  const parentAccount = await server.loadAccount(parentPublicKey);
  const nativeBalance = parentAccount.balances.find(
    (item) => item.asset_type === "native"
  );
  if (
    parseFloat(nativeBalance.balance) <
    nativeBalance.subentry_count * 1 + 2 + 1 + 0.00001
  ) {
    console.log("insufficient base reserve to create trustline");
    return;
  }
  const trustlineTx = new TransactionBuilder(parentAccount, {
    fee: BASE_FEE,
    networkPassphrase: "Diamante Testnet 2024",
  });
  const _asset = new Asset(assetCode, distributorPublicKey);
  trustlineTx
    .addOperation(
      Operation.changeTrust({
        asset: _asset,
      })
    )
    .setTimeout(0);
  const trustlineTxBuilt = trustlineTx.build();
  trustlineTxBuilt.sign(parentKeypair);
  const trustlineResponse = await server.submitTransaction(trustlineTxBuilt);
  console.log("trustline response okkk");
  console.log("creating trustline done");
}
//Mint Asset
async function mintAsset(
  parentKeypair,
  distributorKeypair,
  assetCode,
  supply,
  server
) {
  const parentPublicKey = parentKeypair.publicKey();
  const distributorPublicKey = distributorKeypair.publicKey();
  // Loading  distributor account
  const distributorAccount = await server.loadAccount(distributorPublicKey);
  const paymentTx = new TransactionBuilder(distributorAccount, {
    fee: BASE_FEE,
    networkPassphrase: "Diamante Testnet 2024",
  })
    .addOperation(
      Operation.payment({
        destination: parentPublicKey,
        asset: new Asset(assetCode, distributorPublicKey),
        amount: supply,
      })
    )

    .setTimeout(100)
    .build();
    
  paymentTx.sign(distributorKeypair);
  const paymentResponse = await server.submitTransaction(paymentTx);
  console.log("payment Response okk");
  console.log("Asset minted, check your wallet, Congrats your token minted");
  //await setMasterKeyWeight(distributorAccount, distributorKeypair, server);
}

//Set masterKey Weight
// async function setMasterKeyWeight(account, keypair, server) {
//   const setOptionsTx = new TransactionBuilder(account, {
//     fee: BASE_FEE,
//     networkPassphrase: "Diamante Testnet 2024",
//   })
//     .addOperation(
//       Operation.setOptions({
//         masterWeight: 1,
//       })
//     )
//     .setTimeout(0)
//     .build();
//   setOptionsTx.sign(keypair);
//   const setOptionsResponse = await server.submitTransaction(setOptionsTx);
//   console.log("set options response pass");
// }


async function mint() {
  const assetCode = "AnuToken";
  const supply = "10000000";
  const parentKeypair = Keypair.fromSecret(secret);
  const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");
  const distributorKeypair = await createAccount(parentKeypair, server);
  const distributorPublicKey = distributorKeypair.publicKey();
  await changeTrust(parentKeypair, assetCode, distributorPublicKey, server);
  await mintAsset(parentKeypair, distributorKeypair, assetCode, supply, server);
}
(async () => {
  await mint();
})();

// YOU CAN CHECK YOUR TOKEN https://diamtestnet.diamcircle.io/accounts/{PUBLICKEY}
