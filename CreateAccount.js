const {
  Aurora,
  Keypair,
  Operation,
  BASE_FEE,
  TransactionBuilder,
} = require("diamnet-sdk");
const secret = "SBAABNEZNGN4JRVDCDKOBCBRM7DGVZGOCAVNE3IRRC53TMJNH4BGLCSC";

async function CreateAccount(secret) {
  const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");
  const sourceKeypair = Keypair.fromSecret(secret);
  const account = await server.loadAccount(sourceKeypair.publicKey());
  if (!account) {
    throw new Error("Source account not found");
  }
  const newKeypair = Keypair.random();
  const newAccountPublicKey = newKeypair.publicKey();
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: "Diamante Testnet 2024",
  })
  .addOperation(
    Operation.createAccount({
      destination: newAccountPublicKey,
      startingBalance: "10.0000000",
    })
  )
  .setTimeout(30)
  .build();

  tx.sign(sourceKeypair);
  //console.log("Transaction signed:", tx.toEnvelope().toXDR("base64"));

  try {
    const response = await server.submitTransaction(tx);
    if (response.successful) {
      console.log("New account public key:", newAccountPublicKey);
      console.log("New account secret:", newKeypair.secret());
    } else {
      console.error("Transaction failed:", response);
    }
  } catch (error) {
    console.error("Transaction submission error:", error);
  }
}

(async () => {
  await CreateAccount(secret);
})();
