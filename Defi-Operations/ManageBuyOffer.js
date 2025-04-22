// Import necessary modules from the Diamnet SDK
const {
    Asset,
    Aurora,
    BASE_FEE,
    Keypair,
    Networks,
    Operation,
    TransactionBuilder,
} = require("diamnet-sdk");

// Secret key for the account initiating the buy offer
// Replace this with the account's secret key securely
const secret = "SAZNYHS73MGFUKUU4JTIXBZETWQGL7UJFPXTBOY4EAMX4HO35OJB2OLJ";

// Connect to the Diamnet testnet server
const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");

// Load the keypair and public key from the secret key
const sourceKeypair = Keypair.fromSecret(secret);
const sourcePublicKey = sourceKeypair.publicKey();

/**
 * Function to create a buy offer for a specific asset using Diamnet's `manageBuyOffer` operation.
 *
 * @param {string} buyingAssetCode - The asset code for the asset to buy.
 * @param {string} buyingAssetIssuer - The public key of the asset issuer.
 * @param {string} amount - The amount of the buying asset to purchase.
 * @param {string} price - The price of the asset (in terms of the selling asset).
 */
async function createBuyOffer(buyingAssetCode, buyingAssetIssuer, amount, price) {
    try {
        // Validate input parameters
        if (Number(amount) <= 0 || Number(price) <= 0) {
            throw new Error("Amount and price must be positive numbers.");
        }

        // Define the buying asset using the asset code and issuer
        const buyingAsset = new Asset(buyingAssetCode, buyingAssetIssuer);

        // Define the selling asset as the native asset (e.g., DIAM)
        const sellingAsset = Asset.native();

        console.log("Creating buy offer with amount:", amount, "and price:", price);

        // Load the account details from the server
        const account = await server.loadAccount(sourcePublicKey);

        // Create a transaction builder for the account
        const transaction = new TransactionBuilder(account, {
            fee: BASE_FEE, // Set the base transaction fee
            networkPassphrase: Networks.TESTNET, // Specify the Diamnet testnet network passphrase
        });

        // Optional: Check if a trustline exists for the buying asset
        // Uncomment the following block if trustlines need to be validated before creating the offer
        /*
        const trustlines = await server.loadAccount(sourcePublicKey).then(account => account.balances);
        const trustlineExists = trustlines.some(balance =>
            balance.asset_code === buyingAssetCode && balance.asset_issuer === buyingAssetIssuer
        );

        if (!trustlineExists) {
            // Add an operation to create a trustline for the buying asset
            transaction.addOperation(Operation.changeTrust({
                asset: buyingAsset,
            }));
        }
        */

        // Add the `manageBuyOffer` operation to the transaction
        transaction.addOperation(Operation.manageBuyOffer({
            buying: buyingAsset, // Asset to buy
            selling: sellingAsset, // Asset to sell (native asset)
            buyAmount: parseFloat(amount).toFixed(7), // Amount to buy (rounded to 7 decimal places)
            price: parseFloat(price).toFixed(7), // Price of the asset (rounded to 7 decimal places)
            offerId: "0", // Use "0" to create a new offer
        }));

        // Set the transaction timeout
        transaction.setTimeout(30);

        // Build the transaction
        const builtTransaction = transaction.build();

        // Sign the transaction with the source keypair
        builtTransaction.sign(sourceKeypair);

        // Submit the transaction to the Diamnet server
        const result = await server.submitTransaction(builtTransaction);
        console.log("Buy offer created successfully...");
    } catch (error) {
        // Handle any errors during the process
        console.error("Error creating buy offer:", error);
        throw error;
    }
}

// Example call to create a buy offer
createBuyOffer(
    "TDIAM", // Asset code for the asset to buy
    "GCT56NNNPUTAGN3FHDKY5QNLTXO2BBRYHO6457H4TXSHOOGX47KB2BLP", // Asset issuer's public key
    "10", // Amount to buy
    "1" // Price of the asset
).catch(error => {
    console.error("Failed to create buy offer:", error);
});
