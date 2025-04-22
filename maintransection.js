const {
    Asset,
    Aurora,
    BASE_FEE,
    Keypair,
    Networks,
    Operation,
    Server,
    TransactionBuilder,
  } = require("diamnet-sdk");
  const axios = require("axios");
  
  // Source account secret key
  const sourceSecret = "SBFYHZG6FL4GTODDVXPOJANA3LBJZECOV45GYXNRSIPUMXCNEEXZBIOU";
  // Destination account secret key
  const destinationSecret = "SBFYHZG6FL4GTODDVXPOJANA3LBJZECOV45GYXNRSIPUMXCNEEXZBIOU";
  
  // Asset details
  const assetCode = "BAN";
  const assetIssuer = "GCMZQE2GWKHJVGOGCRZHXKXBY4FSOCWQTJOQKQ4Q7XPTNEEDO6MS4ME6";
  
  // Amount to send
  const amount = "200";
  
  async function createTrustlineAndSendAsset(sourceSecret, destinationSecret, assetCode, assetIssuer, amount) {
    const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");
    const sourceKeypair = Keypair.fromSecret(sourceSecret);
    const destinationKeypair = Keypair.fromSecret(destinationSecret);
  
    const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());
    const destinationAccount = await server.loadAccount(destinationKeypair.publicKey());
  
    if (!sourceAccount) {
      throw new Error("Source account not found");
    }
  console.log("checkkk", sourceKeypair.publicKey())
    if (!destinationAccount) {
      throw new Error("Destination account not found");
    }

    console.log(sourceKeypair.publicKey())
  
    const tx = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: "Diamante Testnet 2024",
    })
      .addOperation(
        Operation.changeTrust({
          asset: new Asset(assetCode, assetIssuer),
          source: destinationKeypair.publicKey(),
        })
      )
      .addOperation(
        Operation.payment({
          destination:destinationKeypair.publicKey(),
          asset: new Asset(assetCode, assetIssuer),
          amount: "1",
        })
      )
      .setTimeout(0)
      .build();
      tx.sign(sourceKeypair, destinationKeypair);
    // tx.sign();
 
  
    try {
      const response = await server.submitTransaction(tx);
      if (response.successful) {
        console.log("Trustline created and asset sent successfully");
      } else {
        console.error("Transaction failed:", response);
      }
    } catch (error) {
      console.error("Error submitting transaction:", error.response.data.extras);
    }
  }
  
  (async () => {
    await createTrustlineAndSendAsset(sourceSecret, destinationSecret, assetCode, assetIssuer, amount);
  })();
  