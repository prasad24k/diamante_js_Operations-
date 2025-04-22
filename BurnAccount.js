const {
    Aurora,
    Keypair,
    Operation,
    BASE_FEE,
    TransactionBuilder,
    Asset,
  } = require("diamnet-sdk");
  
  const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");
  const sourceSecret = "SBZM56J24QK7IHSUXXROFZSYFIIUG3IOWGXACML7DF42FRBNJWAY3VGS";
  const sourceKeypair = Keypair.fromSecret(sourceSecret);
  const sourcePublicKey = sourceKeypair.publicKey();
  
  async function createAccount() {
    try {
      const account = await server.loadAccount(sourcePublicKey);
      const newKeypair = Keypair.random();
      const newAccountPublicKey = newKeypair.publicKey();
  
      console.log("Creating new account:", newAccountPublicKey);
  
      const tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: "Diamante Testnet 2024",
      })
        .addOperation(
          Operation.createAccount({
            destination: newAccountPublicKey,
            startingBalance: "2.0000000",
          })
        )
        .setTimeout(30)
        .build();
  
      tx.sign(sourceKeypair);
      const response = await server.submitTransaction(tx);
  
      if (response.successful) {
        console.log("✅ New account created:", newAccountPublicKey);
        console.log("🔑 Secret:", newKeypair.secret());
  
        // Add Trustline
        await createTrustline(newKeypair);
  
        // Set Options to burn the account
        await setOption(newKeypair);
  
      } else {
        console.error("❌ Failed to create new account:", response);
      }
    } catch (error) {
      console.error("Error creating account:", error);
    }
  }
  
  async function createTrustline(newKeypair) {
    try {
      const assetCode = "DiamAi";
      const assetIssuer = "GCLTAGCZVONPKLULSD4XZOMSJZSUVJYOK2SQQHD4KRNN3TZWXG57RG23";
      const asset = new Asset(assetCode, assetIssuer);
  
      const account = await server.loadAccount(newKeypair.publicKey());
  
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: "Diamante Testnet 2024",
      })
        .addOperation(Operation.changeTrust({
          asset: asset,
        }))
        .setTimeout(30)
        .build();
  
      transaction.sign(newKeypair);
      const result = await server.submitTransaction(transaction);
  
      console.log("✅ Trustline created for asset:", assetCode);
      return result;
    } catch (error) {
      console.error("❌ Error creating trustline:", error);
    }
  }
  
  async function setOption(newKeypair) {
    try {
      const account = await server.loadAccount(newKeypair.publicKey());
  
      const tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: "Diamante Testnet 2024",
      })
        .addOperation(
          Operation.setOptions({
            masterWeight: 0,    // Disable master key
            lowThreshold: 0,
            medThreshold: 0,
            highThreshold: 0,
          })
        )
        .setTimeout(30)
        .build();
  
      tx.sign(newKeypair);
      const response = await server.submitTransaction(tx);
  
      if (response.successful) {
        console.log("🔥 Account successfully burned!");
      } else {
        console.error("❌ Failed to burn account:", response);
      }
    } catch (error) {
      console.error("Error burning account:", error);
    }
  }
  
  (async () => {
    await createAccount();
  })();
  