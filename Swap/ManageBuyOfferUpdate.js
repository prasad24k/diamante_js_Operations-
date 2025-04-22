const {
    Asset,
    Aurora,
    BASE_FEE,
    Keypair,
    Operation,
    TransactionBuilder,
  } = require("diamnet-sdk");
  
  const secret = "SAUL6DWXXTHKSZUXYWVCTQPDQCCGCVMTAZWIABZSZKS4GSV4RD4EGE2T";
  const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");
  
  const sourceKeypair = Keypair.fromSecret(secret);
  const sourcePublicKey = sourceKeypair.publicKey();
  
  // Create Buy Offer to buy yDIAM using Diam
  async function deleteBuyOffer(offerId) {
    const account = await server.loadAccount(sourcePublicKey);
  
    // Build the transaction to delete the buy offer
    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: "Diamante Testnet 2024",
    })
      .addOperation(
        Operation.manageBuyOffer({
          selling: Asset.native(), // Sell Diam
          buying: new Asset(
            "BRAINS",
            "GCD3XUJTZQUT7FEN7M4F2RECBBMP2MN7N3UU3ACJNA2RBQJLKWRNF7SJ"
          ), // Buy yDIAM
          buyAmount: "0", // Set amount to 0 to cancel the offer
          price: "1.0000000", // Price per unit of yDIAM (it could be the original price)
          offerId: offerId, // Offer ID to cancel
        })
      )
      .setTimeout(30)
      .build();
  
    // Sign and submit the transaction
    transaction.sign(sourceKeypair);
    const result = await server.submitTransaction(transaction);
    console.log("Transaction result hash:", result.hash);
  }
  
  (async () => {
    const offerIdToDelete = "7432"; // The offer ID you want to delete
  
    await deleteBuyOffer(offerIdToDelete);
  })();
  