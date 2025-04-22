const {
  Asset,
  Aurora,
  BASE_FEE,
  Keypair,
  Operation,
  TransactionBuilder,
} = require("diamnet-sdk");

const secret = "SAGBLJE3F7WYIVV7A62NKLV4H3YMMZXLGTNQSEJ5HSJCAP2ZMP3VHR57";
const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");

const sourceKeypair = Keypair.fromSecret(secret);
const sourcePublicKey = sourceKeypair.publicKey();

// Create Buy Offer to buy yDIAM using Diam
async function createBuyOffer(amount, price) {
    const account = await server.loadAccount(sourcePublicKey);

    // Build the transaction
    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: "Diamante Testnet 2024",
    })
      .addOperation(
        Operation.manageBuyOffer({
          selling: Asset.native(), // Sell Diam
          buying: new Asset( "ONDO", "GAEKQVPQFAIKMKDVIXUYWGL24R2AWINH3CHABGAM5AC43DO54WZDT7TY"), // Buy yDIAM
          buyAmount: parseFloat(amount).toFixed(7), // Amount of yDIAM to buy
          price: parseFloat(price).toFixed(7), // Price per unit of yDIAM in Diam
          offerId: "0", // 0 indicates a new offer
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
  const amount = "50"; // Amount of yDIAM to buy
  const price = "1.0000000"; // Price per unit of yDIAM in Diam
  const offerId = await createBuyOffer(amount, price);

  if (offerId) {
    console.log("Offer created with ID:", offerId);
  } else {
    console.log("Failed to create the offer.");
  }
})();
