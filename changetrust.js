const {
    Asset,
    Aurora,
    BASE_FEE,
    Keypair,
    Networks,
    Operation,
    TransactionBuilder,
  } = require("diamnet-sdk");
  
  const secret = "SCH7JP5P6YPAEEKBF44HR5ZBGNGFXMSLKAFVMVQXZARF2TVCQZXECRVP";
  const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");
  
  
  const sourceKeypair = Keypair.fromSecret(secret);
  const sourcePublicKey = sourceKeypair.publicKey();
  console.log("publickey..",sourcePublicKey)
  
  async function createTrustline(assetCode, assetIssuer) {
    try {
      const asset = new Asset(assetCode, assetIssuer);
      console.log("Creating trustline for asset:", assetCode);
  
      const account = await server.loadAccount(sourcePublicKey);
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: "Diamante Testnet 2024",
      })
        .addOperation(Operation.changeTrust({
          asset: asset,
        }))
        .setTimeout(30)
        .build();
  
      transaction.sign(sourceKeypair);
      const result = await server.submitTransaction(transaction);
      console.log("Trustline created successfully.....");
      return result;
    } catch (error) {
      console.error("Error creating trustline:", error);
      throw error;
    }
  }
  
  createTrustline("DiamAi","GCLTAGCZVONPKLULSD4XZOMSJZSUVJYOK2SQQHD4KRNN3TZWXG57RG23")
    .then(result => {
      console.log("Trustline result:",result.hash);
    })
    .catch(error => {
      console.error("Failed to create trustline:", error);
    });
  