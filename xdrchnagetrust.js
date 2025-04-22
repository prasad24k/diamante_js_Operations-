const {
    Asset,
    Aurora,
    BASE_FEE,
    Keypair,
    Networks,
    Operation,
    Server,
    TransactionBuilder,
    xdr
  } = require("diamnet-sdk");
  
  const sourcePublicKey = "GDQFQXYJIGGROCXN647NQYFC5JRF675PZIOEQFCQZW5ZYSFFPZHKH7HH";
  const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");
  
  async function createTrustline(assetCode, assetIssuer) {
    try {
      const asset = new Asset(assetCode, assetIssuer);
      console.log("Creating trustline for asset:", assetCode);
  
      const account = await server.loadAccount(sourcePublicKey);
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(Operation.changeTrust({
          asset: asset,
          limit: "1000000000",
        }))
        .setTimeout(30)
        .build();
  
      const transactionXDR = transaction.toXDR();
      console.log("Transaction XDR:", transactionXDR);
      return transactionXDR;
    } catch (error) {
      console.error("Error creating trustline:", error);
      throw error;
    }
  }
  createTrustline("CAT", "GBHHU65KNWOSXH3HWPADXMONMIVDH4V4PRXSNBWFKVCEW27HEESJXZIH")
    .then(result => {
      console.log("Trustline result (XDR):", result);
    })
    .catch(error => {
      console.error("Failed to create trustline:", error);
    });
  