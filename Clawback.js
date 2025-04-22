const {
  Asset,
  Aurora,
  BASE_FEE,
  Keypair,
  Operation,
  TransactionBuilder,
  StrKey
} = require("diamnet-sdk");

const secret = "SBNSPB4X3YHFYSXOPLBXY4D63HUJ7X73PZKPAPTNYT5SSGAC56VLGJZU";
const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");

async function clawback(fromAccountId, assetCode, distributorPublicKey, amount, server) {
  const sourceKeypair = Keypair.fromSecret(secret);
  const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());

  if (!StrKey.isValidEd25519PublicKey(distributorPublicKey)) {
    throw new Error("Invalid distributor public key");
  }

  // Check if the asset exists and if clawback is enabled
  const assets = await server.assets().forIssuer(distributorPublicKey).call();
  const asset = assets.records.find(a => a.asset_code === assetCode);
  if (!asset) {
    throw new Error(`Asset ${assetCode} not found for the given distributor`);
  }
  if (!asset.flags.clawback_enabled) {
    throw new Error(`Clawback is not enabled for asset ${assetCode}`);
  }

  const clawbackTx = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: "Diamante Testnet 2024",
  })
    .addOperation(
      Operation.clawback({
        from: fromAccountId,
        asset: new Asset(assetCode, distributorPublicKey),
        amount: amount.toString(),
      })
    )
    .setTimeout(30)
    .build();

  clawbackTx.sign(sourceKeypair);
  try {
    const clawbackResponse = await server.submitTransaction(clawbackTx);
    console.log("Clawback response:", clawbackResponse);
    return clawbackResponse;
  } catch (error) {
    console.error("Detailed error:", JSON.stringify(error.response.data, null, 2));
    throw error;
  }
}

async function applyClawback() {
  const assetCode = "WSI";
  const distributorPublicKey = "GB5ICLJ6DY6V5QKKUGTF6BXTCDP53PFIPTML4Z6HSHI66CT2DHUDN3F7"; // Removed extra '6'
  const fromAccountId = "GBPF47DP3V6PEQKTBGFWW7V46MJZX6FZXHPNI34ROWXUZVBPTAEFIS64";
  const amountToBurn = "100";

  try {
    await clawback(fromAccountId, assetCode, distributorPublicKey, amountToBurn, server);
    console.log("Clawback operation completed successfully");
  } catch (error) {
    console.error("Error during clawback operation:", error.message);
  }
}

(async () => {
  await applyClawback();
})();