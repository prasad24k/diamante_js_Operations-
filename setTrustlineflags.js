const {
  Keypair,
  TransactionBuilder,
  Operation,
  BASE_FEE,
  Asset,
  Aurora
} = require("diamnet-sdk");

const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");
const issuerSecret = "SAXQEQQXTL62LLI4ABW4OWZ3F6D736SO3FTA37YWQDIHOPITJYEMJY67";
const assetCode = "MYASSET"; // New asset code

async function createAndSetTrustlineFlags() {
  try {
    // generate a new trustor keypair
    const trustorKeypair = Keypair.random();
    const trustorPublicKey = trustorKeypair.publicKey();
    const trustorSecret = trustorKeypair.secret();
    console.log("New Trustor Account Created:");
    console.log("Public Key:", trustorPublicKey);
    console.log("Secret Key:", trustorSecret);

    const issuerKeypair = Keypair.fromSecret(issuerSecret);
    const issuerAccount = await server.loadAccount(issuerKeypair.publicKey());

    //fund the trustor account
    const fundTx = new TransactionBuilder(issuerAccount, {
      fee: BASE_FEE,
      networkPassphrase: "Diamante Testnet 2024",
    })
      .addOperation(
        Operation.createAccount({
          destination: trustorPublicKey,
          startingBalance: "10",
        })
      )
      .setTimeout(30)
      .build();

    fundTx.sign(issuerKeypair);

    const fundResult = await server.submitTransaction(fundTx);
    console.log("Trustor account funded successfully:", fundResult.hash);

    // trustor establishes a trustline for the asset
    const trustorAccount = await server.loadAccount(trustorPublicKey);
    const newAsset = new Asset(assetCode, issuerKeypair.publicKey());

    const trustlineTx = new TransactionBuilder(trustorAccount, {
      fee: BASE_FEE,
      networkPassphrase: "Diamante Testnet 2024",
    })
      .addOperation(
        Operation.changeTrust({
          asset: newAsset,
          limit: "1000", 
        })
      )
      .setTimeout(30)
      .build();

    trustlineTx.sign(trustorKeypair);

    const trustlineResult = await server.submitTransaction(trustlineTx);
    console.log("Trustline established successfully:", trustlineResult.hash);
    const issuerAccountAfterFunding = await server.loadAccount(issuerKeypair.publicKey());

    // Set trustline flags for the trustor account
    const setFlagsTx = new TransactionBuilder(issuerAccountAfterFunding, {
      fee: BASE_FEE,
      networkPassphrase: "Diamante Testnet 2024",
    })
      .addOperation(
        Operation.setTrustLineFlags({
          trustor: trustorPublicKey,
          asset: newAsset,
          flags: {
            authorized: true, // Trustor is authorized to transact with the asset
            authorizedToMaintainLiabilities: false, // Optional
          },
        })
      )
      .setTimeout(30)
      .build();

    setFlagsTx.sign(issuerKeypair);

    const setFlagsResult = await server.submitTransaction(setFlagsTx);
    console.log("Trustline flags set successfully:", setFlagsResult.hash);
  } catch (error) {
    console.error("Error during operation:", error.response?.data || error.message);
  }
}

createAndSetTrustlineFlags();
