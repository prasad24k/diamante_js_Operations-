const {
    Asset,
    Aurora,
    BASE_FEE,
    Keypair,
    Operation,
    TransactionBuilder,
  } = require("diamnet-sdk");
  
  const secret = "SAHQFVZQYMYOBEIKITXMOO4PRUFD2I4BG5HHZGLND42YDGXTQL6FDEHR";
  const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");
  
  const sourceKeypair = Keypair.fromSecret(secret);
  const sourcePublicKey = sourceKeypair.publicKey();
  
  // Function to delete an offer
  async function deleteOffer(offerId, sellingAssetCode, sellingAssetIssuer, buyingAssetType) {
    const sellingAsset = new Asset(sellingAssetCode, sellingAssetIssuer); // The asset being sold
    const buyingAsset = Asset.native(); // Native asset (Diam)
  
    const account = await server.loadAccount(sourcePublicKey);
  
    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: "Diamante Testnet 2024", // Ensure this matches your testnet configuration
    })
      .addOperation(
        Operation.manageSellOffer({
          selling: sellingAsset,
          buying: buyingAsset,
          amount: "0", // Setting amount to 0 deletes the offer
          price: "1", // Price doesn't matter when deleting
          offerId: offerId, // ID of the offer to delete
        })
      )
      .setTimeout(30)
      .build();
  
    transaction.sign(sourceKeypair);
  
    const result = await server.submitTransaction(transaction);
  
    console.log("Offer deleted successfully!");
    console.log("Transaction result:", result.hash);
  }
  
  // Call the deleteOffer function
  (async () => {
    const offerId = "3879"; // ID of the offer to delete
    const sellingAssetCode = "yDIAM"; // The asset being sold
    const sellingAssetIssuer = "GABD54Z4YI2AHW4E6UY77NKUFFSV2VU2CXZN7EOUEPVZKL6YLN2N743N"; // Issuer of the asset
    const buyingAssetType = "native"; // The asset being bought (native Diam)
  
    await deleteOffer(offerId, sellingAssetCode, sellingAssetIssuer, buyingAssetType);
  })();
  