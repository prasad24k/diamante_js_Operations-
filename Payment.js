const {
  Asset,
  Aurora,
  BASE_FEE,
  Keypair,
  Operation,
  TransactionBuilder,
} = require("diamnet-sdk");
const axios = require("axios");
const secret = "SC4LKZXRDH4FJN76TVTGHYBNRXH742IHKEJY27TTPDIIYHVIYGFTXPNR";
async function Payment(secret) {
  const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");
  const sourceKeypair = Keypair.fromSecret(secret);
  const account = await server.loadAccount(sourceKeypair.publicKey());
  console.log("Public key : ", sourceKeypair.publicKey());
  if (!account) {
    throw new Error("Source account not found");
  }
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: "Diamante Testnet 2024",
  })
      .addOperation(
      Operation.payment({
        destination: "GC7EARGL7GYJYFIHOITOGGAHPB7EVVIC5N43J3Z2TIIFBLQOE3XT5LEJ",
        asset: Asset.native(),
        amount: "499",
      })
    )
    .setTimeout(30)
    .build();
  tx.sign(sourceKeypair);
 // console.trace('the transection process ',tx)
  console.log('the transe')
  //console.log("Transaction signed:", tx.toEnvelope().toXDR("base64"));
  const response = await server.submitTransaction(tx);
  if (response.successful) {
    console.log("Transaction successful",response.hash);
  } else {
    console.error("Transaction failed:");
  }
}

(async () => {
  await Payment(secret);
})();
