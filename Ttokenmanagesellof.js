const {
    Asset,
    Aurora,
    BASE_FEE,
    Keypair,
    Networks,
    Operation,
    TransactionBuilder,
  } = require("diamnet-sdk");
  
  const secret = "SC5Z7OELSG2ERY2FGA7DQTXTC2NPJBJLRUOSJ3GMBSJG6KPQYPQQ56RE";
  const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");
  
  const sourceKeypair = Keypair.fromSecret(secret);
  const sourcePublicKey = sourceKeypair.publicKey();
  
  async function createSellOffer(sellingAssetCode, sellingAssetIssuer, buyingAssetCode, buyingAssetIssuer, amount, price) {
    try {
      if (amount <= 0 || price <= 0) {
        throw new Error("Amount and price must be positive numbers.");
      }
  
      const sellingAsset = new Asset(sellingAssetCode, sellingAssetIssuer);
      const buyingAsset = new Asset(buyingAssetCode, buyingAssetIssuer);
      console.log("Creating sell offer with amount:", amount, "and price:", price);
  
      const account = await server.loadAccount(sourcePublicKey);
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(Operation.manageSellOffer({
          selling: sellingAsset,
          buying: buyingAsset,
          amount: amount.toString(),
          price: price.toString(),
          offerId: "0" 
        }))
        .setTimeout(30)
        .build();
  
      transaction.sign(sourceKeypair);
      const result = await server.submitTransaction(transaction);
      console.log("Sell offer created successfully.....");
      const offerId = result.offerResults[0].currentOffer.offerId;
      console.log("Created offer ID:", offerId);
      return offerId;
    } catch (error) {
      console.error("Error creating sell offer:", error);
      throw error;
    }
  }
  createSellOffer("native", "GB2QTRP7N6WNGQGLYK6TUYHIS3HYNT7Z3QJ2YCA5LRK4T5WI6OSLW7EC", "YDIAM", "GC7DOCZIRBWWDZO53ZUN5YTKRWHHPEB7EECU5BL7XUYKTAGQGY6D4YSH", 1, 1)
    .then(offerId => {
      console.log("Offer ID:", offerId);
    })
    .catch(error => {
      console.error("Failed to create sell offer:", error);
    });
  