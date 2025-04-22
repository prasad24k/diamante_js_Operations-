const {
  Asset,
  Aurora,
  BASE_FEE,
  Keypair,
  Networks,
  Operation,
  Server,
  TransactionBuilder,
} = require("diamnet-sdk");

const secret = "SAPFGFVNFMW5GTWT3C2BTAV6Y64SXHEOOQRVL3L5LXTP4OI3O6UY7OWO";
const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");

const sourceKeypair = Keypair.fromSecret(secret);
const sourcePublicKey = sourceKeypair.publicKey();

// Create Sell Offer for any token(in this Operation its use to create Initial Offer for token )
async function createSellOffer(sellingAssetCode, sellingAssetIssuer, buyingAssetCode, buyingAssetIssuer, amount, price) {
  const sellingAsset = new Asset(sellingAssetCode, sellingAssetIssuer);
  const buyingAsset = new Asset(buyingAssetCode, buyingAssetIssuer);
  console.log("Creating sell offer with amount:", amount, "and price:", price);
  const account = await server.loadAccount(sourcePublicKey);
  const transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: "Diamante Testnet 2024",
  })
    .addOperation(Operation.manageSellOffer({
      selling: sellingAsset,
      buying: buyingAsset,
      amount: amount,
      price: price,
      offerId: "0" // 0 for a new offer
    }))
    .setTimeout(30)
    .build();
  transaction.sign(sourceKeypair);
  const result = await server.submitTransaction(transaction);
  console.log("Sell offer created successfully.....");
  const offerId = result.offerResults[0].currentOffer.offerId;
  console.log("Created offer ID:", offerId);
  return offerId;
}

// // Update the Sell offer using offerID
// async function updateSellOffer(offerId, sellingAsset, buyingAsset, amount, price) {
//   const account = await server.loadAccount(sourcePublicKey);
//   const transaction = new TransactionBuilder(account, {
//     fee: BASE_FEE,
//     networkPassphrase: "Diamante Testnet 2024",
//   })
//     .addOperation(Operation.manageSellOffer({
//       selling: sellingAsset,
//       buying: buyingAsset,
//       amount: amount,
//       price: price,
//       offerId: offerId,
//     }))
//     .setTimeout(30)
//     .build();
//   transaction.sign(sourceKeypair);
//   const result = await server.submitTransaction(transaction);
//   console.log('Sell offer updated successfully..........');
//   return result;
// }

// // Delete the Sell offer
// async function deleteSellOffer(offerId, sellingAsset, buyingAsset, price) {
//   const account = await server.loadAccount(sourcePublicKey);
//   const transaction = new TransactionBuilder(account, {
//     fee: BASE_FEE,
//     networkPassphrase: "Diamante Testnet 2024"
//   })
//     .addOperation(Operation.manageSellOffer({
//       selling: sellingAsset,
//       buying: buyingAsset,
//       amount: "0", // Set amount to 0 to delete the offer
//       price: "1", // Pass the Price object
//       offerId: offerId,
//     }))
//     .setTimeout(30)
//     .build();
//   transaction.sign(sourceKeypair);
//   const result = await server.submitTransaction(transaction);
//   console.log('Sell offer deleted successfully..........');
//   return result;
// }

(async () => {
    //Create Sell Offer for any Asset
    const sellingAssetCode = "native"; // selling asset code
    const sellingAssetIssuer = "GDRXZH4H22HE4WKEYT54XFYWOMFH5XCP4ZXWN2RYWG4P7C4PZJ4H57TU"; // selling asset issuer
    const buyingAssetCode = "YDIAM"; // buying asset
    const buyingAssetIssuer = "GC7DOCZIRBWWDZO53ZUN5YTKRWHHPEB7EECU5BL7XUYKTAGQGY6D4YSH";
    const amount = "5"; // Amount of selling asset to sell
    const price = "1"; // Price per unit of selling asset
    const offerId = await createSellOffer(sellingAssetCode, sellingAssetIssuer, buyingAssetCode, buyingAssetIssuer, amount, price);

    // // Updating the offer
    // const offerId = "7";
    // await updateSellOffer(offerId, new Asset(sellingAssetCode, sellingAssetIssuer), new Asset(buyingAssetCode, buyingAssetIssuer), amount, price);

    // Delete the offer
    // const sellingAssetCode = "native"; // selling asset code
    // const sellingAssetIssuer = "GDRXZH4H22HE4WKEYT54XFYWOMFH5XCP4ZXWN2RYWG4P7C4PZJ4H57TU"; // selling asset issuer
    // const buyingAssetCode = "CAT"; // buying asset
    // const buyingAssetIssuer = "GBHHU65KNWOSXH3HWPADXMONMIVDH4V4PRXSNBWFKVCEW27HEESJXZIH";
    // const offerId = "7"; 
    // await deleteSellOffer(offerId, new Asset(sellingAssetCode, sellingAssetIssuer), new Asset(buyingAssetCode, buyingAssetIssuer));

})();
