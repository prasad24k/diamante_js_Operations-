const {
  Asset,
  Aurora,
  BASE_FEE,
  Keypair,
  Operation,
  TransactionBuilder,
} = require("diamnet-sdk"); // Import necessary modules from Diamnet SDK

const secret = "SCYER7WUB3HQ3NK3YULVGVBP3FF6CGHUTPJ2YBI7LFGTP4XQZRPTENPO"; // Secret key of the source account
const server = new Aurora.Server("https://diamtestnet.diamcircle.io/"); // Diamnet testnet server URL

const sourceKeypair = Keypair.fromSecret(secret); // Generate a Keypair object from the secret key
const sourcePublicKey = sourceKeypair.publicKey(); // Get the public key from the Keypair

/**
 * Create a sell offer for the native asset (e.g., Diam) to exchange it for another token
 * 
 * @param {string} buyingAssetCode - Code of the asset to be bought
 * @param {string} buyingAssetIssuer - Public key of the issuer of the asset to be bought
 * @param {string} amount - Amount of the selling asset to sell
 * @param {string} price - Price per unit of the selling asset
 */
async function createSellOffer(buyingAssetCode, buyingAssetIssuer, amount, price) {
  try {
    // Define the selling asset as the native asset (e.g., Diam)
    const sellingAsset = Asset.native();

    // Define the buying asset using the provided code and issuer
    const buyingAsset = new Asset(buyingAssetCode, buyingAssetIssuer);

    console.log("Creating sell offer with amount:", amount, "and price:", price);

    // Load the account details for the source public key
    const account = await server.loadAccount(sourcePublicKey);

    // Build a transaction to create a sell offer
    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: "Diamante Testnet 2024", // Passphrase for the Diamante testnet
    })
      .addOperation(
        Operation.manageSellOffer({
          selling: sellingAsset, // Asset being sold (native asset)
          buying: buyingAsset, // Asset being bought
          amount: amount, // Amount of the selling asset
          price: price, // Price per unit of the selling asset
          offerId: "0", // Use "0" for creating a new offer
        })
      )
      .setTimeout(30) // Set a timeout for the transaction (30 seconds)
      .build();

    // Sign the transaction using the source account's secret key
    transaction.sign(sourceKeypair);

    // Submit the transaction to the Diamnet server
    const result = await server.submitTransaction(transaction);

    console.log("Sell offer created successfully!");
    console.log("Transaction result:", result);

    // Query all offers for the source account to verify the created offer
    const offers = await server
      .offers()
      .forAccount(sourcePublicKey)
      .call();

    // Find the offer matching the specified details
    const createdOffer = offers.records.find(
      (offer) =>
        offer.selling.asset_type === "native" && // Ensure the selling asset is native
        offer.buying.asset_code === buyingAssetCode && // Match the buying asset code
        offer.buying.asset_issuer === buyingAssetIssuer && // Match the buying asset issuer
        offer.amount === amount && // Match the amount
        offer.price === price // Match the price
    );

    if (createdOffer) {
      console.log("Created offer ID:", createdOffer.id);
      return createdOffer.id; // Return the ID of the created offer
    } else {
      console.log("Offer not found in the account's offer list.");
      return null;
    }
  } catch (error) {
    console.error("Error creating sell offer:", error);
  }
}

// Example usage: Create a sell offer
(async () => {
  const buyingAssetCode = "CAT"; // Code of the asset to be bought
  const buyingAssetIssuer = "GBHHU65KNWOSXH3HWPADXMONMIVDH4V4PRXSNBWFKVCEW27HEESJXZIH"; // Issuer of the buying asset
  const amount = "1.0000000"; // Amount of the selling asset to sell
  const price = "1.0000000"; // Price per unit of the selling asset
  const offerId = await createSellOffer(buyingAssetCode, buyingAssetIssuer, amount, price); // Create the sell offer
})();
