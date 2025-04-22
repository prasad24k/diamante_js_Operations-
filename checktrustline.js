const {
    Asset,
    Aurora,
    Keypair,
    Networks,
    Server,
  } = require("diamnet-sdk");
  
  const publicKey = "SCYER7WUB3HQ3NK3YULVGVBP3FF6CGHUTPJ2YBI7LFGTP4XQZRPTENPO";
  const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");
  
  async function checkTrustline(assetCode, assetIssuer) {
    try {
      const asset = new Asset(assetCode, assetIssuer);
      console.log("Checking trustline for asset:", assetCode);
  
      const account = await server.loadAccount(publicKey);
      const balances = account.balances;
  
      const trustlineExists = balances.some(balance =>
        balance.asset_code === assetCode && balance.asset_issuer === assetIssuer
      );
  
      if (trustlineExists) {
        console.log("Trustline exists for the asset:", assetCode);
      } else {
        console.log("Trustline does not exist for the asset:", assetCode);
      }
  
      return trustlineExists;
    } catch (error) {
      console.error("Error checking trustline:", error);
      throw error;
    }
  }
  
  checkTrustline("TDIAM", "GCT56NNNPUTAGN3FHDKY5QNLTXO2BBRYHO6457H4TXSHOOGX47KB2BLP")
    .then(exists => {
      if (exists) {
        console.log("Trustline exists.");
      } else {
        console.log("Trustline does not exist.");
      }
    })
    .catch(error => {
      console.error("Failed to check trustline:", error);
    });
  