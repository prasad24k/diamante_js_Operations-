const {
    Asset,
    Aurora,
    BASE_FEE,
    Keypair,
    Operation,
    TransactionBuilder,
  } = require("diamnet-sdk");
  
  const secret = "SBM63RUOUMKZRWBZER6WLV4UM2RYNTHAWCQZAZ42BBCWHFGJBHDVXL3T";
  
  async function createPassiveSellOffer(secret) {
    const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");
    const sourceKeypair = Keypair.fromSecret(secret);
    const account = await server.loadAccount(sourceKeypair.publicKey());
  
    if (!account) {
      throw new Error("Source account not found");
    }
  
    const sellingAsset = Asset.native();
    const buyingAsset = new Asset("CAT", "GBHHU65KNWOSXH3HWPADXMONMIVDH4V4PRXSNBWFKVCEW27HEESJXZIH");
  
    console.log("Selling Asset:", sellingAsset);
    console.log("Buying Asset:", buyingAsset);
  
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase:  "Diamante Testnet 2024",
    })
      .addOperation(
        Operation.createPassiveSellOffer({
          selling: sellingAsset,
          buying: buyingAsset,
          amount: "1", // Amount of selling asset to sell
          price: "1", // Price of 1 unit of selling 
        })
      )
      .setTimeout(30)
      .build();
  
    tx.sign(sourceKeypair);
  
    try {
      const response = await server.submitTransaction(tx);
      if (response.successful) {
        console.log("Passive sell offer created successfully", response.hash);
      }
    } catch (error) {
      console.error("Error submitting transaction:", error);
    }
  }
  
  (async () => {
    await createPassiveSellOffer(secret);
  })();
  