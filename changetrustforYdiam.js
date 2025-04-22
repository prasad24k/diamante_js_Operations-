const {
    Asset,
    Aurora,
    BASE_FEE,
    Networks,
    Operation,
    TransactionBuilder,
  } = require("diamnet-sdk");
  
  const publicKey = "GA6UYS6QT4KOW6RHOLRWWWYQI54DJPI2RMOEGPXWTRFWD7YTX6P4BKGC";
  const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");
  
  async function createTrustline(assetCode, assetIssuer) {
    try {
      const asset = new Asset(assetCode, assetIssuer);
      console.log("Creating trustline for asset:", assetCode);
  
      const account = await server.loadAccount(publicKey);
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(Operation.changeTrust({
          asset: asset,
          limit: '1000000000',
        }))
        .setTimeout(30)
        .build();
      const xdrTransaction = transaction.toXDR("base64");
      console.log("Trustline XDR created successfully.....");
      console.log("XDR:", xdrTransaction);
      return xdrTransaction;
    } catch (error) {
      console.error("Error creating trustline XDR:", error);
      throw error;
    }
  }
  
  createTrustline("YDIAM", "GC7DOCZIRBWWDZO53ZUN5YTKRWHHPEB7EECU5BL7XUYKTAGQGY6D4YSH")
    .then(xdr => {
      console.log("Trustline XDR result:", xdr);
    })
    .catch(error => {
      console.error("Failed to create trustline XDR:", error);
    });
  