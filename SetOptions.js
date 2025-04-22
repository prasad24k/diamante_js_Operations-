const {
    Aurora,
    Keypair,
    Operation,
    BASE_FEE,
    TransactionBuilder,
  } = require("diamnet-sdk");
  
  const secret = "SBZM56J24QK7IHSUXXROFZSYFIIUG3IOWGXACML7DF42FRBNJWAY3VGS";
  
  async function CreateAccount(secret) {
    const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");
    const sourceKeypair = Keypair.fromSecret(secret);
    const account = await server.loadAccount(sourceKeypair.publicKey());
    if (!account) {
      throw new Error("Source account not found");
    }
  
    const newKeypair = Keypair.random();
    const newAccountPublicKey = newKeypair.publicKey();
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: "Diamante Testnet 2024",
    })
      .addOperation(
        Operation.createAccount({
          destination: newAccountPublicKey,
          startingBalance: "1.0000000",
        })
      )
      .setTimeout(30)
      .build();
  
    tx.sign(sourceKeypair);
  
      const response = await server.submitTransaction(tx);
      if (response.successful) {
        console.log("New account public key:", newAccountPublicKey);
        console.log("New account secret:", newKeypair.secret());
  
        // Call the setOption function
        await setOption(secret, newKeypair);
      } else {
        console.error("Transaction failed:", response);
      }
    }
  
  async function setOption(secret, newKeypair) {
    const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");
    const account = await server.loadAccount(newKeypair.publicKey());
  
    if (!account) {
      throw new Error("New account not found");
    }
  
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: "Diamante Testnet 2024",
    })
      .addOperation(
        Operation.setOptions({
          clearFlags: 0, // Clear specific flags (e.g., AUTH_REQUIRED_FLAG)
          //setFlags: 1, // Set specific flags (e.g., AUTH_REQUIRED_FLAG)
          masterWeight: 0, // Weight for the master key
          lowThreshold: 0, // Low threshold for operations
          medThreshold: 0, // Medium threshold for operations
          highThreshold: 0, // High threshold for operations
          homeDomain: "", // Domain name associated with the account
          signer: {
            ed25519PublicKey: Keypair.fromSecret(secret).publicKey(),// Add a new signer
            weight: 0,// Weight of the new signer
          },
        })
      )
      .setTimeout(30)
      .build();
  
    tx.sign(newKeypair);
      const response = await server.submitTransaction(tx);
      if (response.successful) {
        console.log("setOption operation successful for new account");
      } else {
        console.error("setOption operation failed:", response);
      }
  }
  
  (async () => {
    await CreateAccount(secret);
  })();
  