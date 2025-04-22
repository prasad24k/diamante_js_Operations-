const {
    Asset,
    Aurora,
    BASE_FEE,
    Keypair,
    Operation,
    TransactionBuilder,
  } = require("diamnet-sdk");
  
  const secret = "SCEU5GYI42UIV5A2UGGNJX7OGSCS2H6NFZXT5PKSACZ3QUQ3CKZTVU4R";
  const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");
  
  const sourceKeypair = Keypair.fromSecret(secret);
  const sourcePublicKey = sourceKeypair.publicKey();
  
  // Create Sell Offer to sell yDiam to Diam
  async function createSellOffer(sellingAmount) {
      
      const account = await server.loadAccount(sourcePublicKey);
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: "Diamante Testnet 2024",
      })
        .addOperation(
          Operation.manageSellOffer({
            selling: new Asset("FLOKI","GBQPL57B6EV5KOXG3KTMDAC7U7RTNGTEKPSWQZVC4QZKRAM5WN76PPLX"),
            buying: Asset.native(),
            amount: parseFloat(sellingAmount).toFixed(7), // Amount of Diam to sell
            price: parseFloat("1.0000000").toFixed(7), // Price per unit of YDIAM in Diam
            offerId: "0",
          })
        )
        .setTimeout(30)
        .build();
  
      transaction.sign(sourceKeypair);
  
      const result = await server.submitTransaction(transaction);
  
      console.log("Sell offer created successfully!");
      console.log("Transaction result:", result.hash);
  
  
    }
  (async () => {
    // Parameters for creating the sell offer
    const sellingAmount = "498"; // Amount of Diam to sell
    await createSellOffer(sellingAmount);
  })();
  