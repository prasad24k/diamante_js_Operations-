const {
  Aurora,
  BASE_FEE,
  Keypair,
  Operation,
  TransactionBuilder,
} = require("diamnet-sdk");
const axios = require("axios");
const secret ="SBNTKLQWUHDNNYBQ7VZVK2TSSXZ5PGYUNXKGOZWA4FIBNI5BX2VWLOCD";

async function activateAndFundAccount(secret, destinationPublicKey) {
  const server = new Aurora.Server("https://mainnet.diamcircle.io");
  const sourceKeypair = Keypair.fromSecret(secret);
  const account = await server.loadAccount(sourceKeypair.publicKey());
  if (!account) {
    throw new Error("Source account not found");
  }

  // Create account operation
  const createAccountTx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: "Diamante MainNet; SEP 2022",
  })
    .addOperation(
      Operation.createAccount({
        destination: destinationPublicKey,
        startingBalance: "0.00001",
      })
    )
    .setTimeout(30)
    .build();

  createAccountTx.sign(sourceKeypair);
  //console.log("Create account transaction signed:", createAccountTx.toEnvelope().toXDR("base64"));

  try {
    const createResponse = await server.submitTransaction(createAccountTx);
    if (createResponse.successful) {
      console.log("Account creation successful..........");
    } 
  } catch (error) {
    console.error("Account Alredy creaetd..");
    return;
  }
}

(async () => {
  const destinationPublicKey = "GC7EARGL7GYJYFIHOITOGGAHPB7EVVIC5N43J3Z2TIIFBLQOE3XT5LEJ";
  await activateAndFundAccount(secret, destinationPublicKey);
})();
