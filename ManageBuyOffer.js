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

const secret = "SBM63RUOUMKZRWBZER6WLV4UM2RYNTHAWCQZAZ42BBCWHFGJBHDVXL3T";
const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");

const sourceKeypair = Keypair.fromSecret(secret);
const sourcePublicKey = sourceKeypair.publicKey();

//Create Buy Offer for any token 
async function createBuyOffer(sellingAssetCode, sellingAssetIssuer, buyingAssetCode, buyingAssetIssuer, amount, price) {
  const sellingAsset = new Asset(sellingAssetCode, sellingAssetIssuer);
  const buyingAsset = new Asset(buyingAssetCode, buyingAssetIssuer);
  console.log("Creating buy offer with amount:", amount, "and price:", price);
    const account = await server.loadAccount(sourcePublicKey);
    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: "Diamante Testnet 2024",
    })
      .addOperation(Operation.manageBuyOffer({
        selling: sellingAsset,
        buying: buyingAsset,
        buyAmount: amount,
        price: price,
        offerId: "0" // 0 for a new offer
      }))
      .setTimeout(30)
      .build();
    transaction.sign(sourceKeypair);
    const result = await server.submitTransaction(transaction);
    console.log("Buy offer created successfully.....");
    const offerId = result.offerResults[0].currentOffer.offerId;
    console.log("Created offer ID:", offerId);
    return offerId;
  }

//update the Buy offer using offerID 
async function updateBuyOffer(offerId, sellingAsset, buyingAsset, amount, price) {
    const account = await server.loadAccount(sourcePublicKey);
    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: "Diamante Testnet 2024",
    })
      .addOperation(Operation.manageBuyOffer({
        selling: sellingAsset,
        buying: buyingAsset,
        buyAmount: amount,
        price: price,
        offerId: offerId,
      }))
      .setTimeout(30)
      .build();
    transaction.sign(sourceKeypair);
    const result = await server.submitTransaction(transaction);
    console.log('Buy offer updated successfully..........:');
    return result;
  }

//Delete the Buy offer 
async function deleteBuyOffer(offerId, sellingAsset, buyingAsset, price) {
  const account = await server.loadAccount(sourcePublicKey);
  const transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: "Diamante Testnet 2024"
  })
  .addOperation(Operation.manageBuyOffer({
    selling: sellingAsset,
    buying: buyingAsset,
    buyAmount: "0", // Set amount to 0 to delete the offer
    price: "1", // Pass the Price object
    offerId: offerId,
  }))
  .setTimeout(30)
  .build();
  transaction.sign(sourceKeypair);
  const result = await server.submitTransaction(transaction);
  console.log('Buy offer deleted successfully..........');
  return result;
}

(async () => {
  //Create Buy Offer for any Asset 
    // const sellingAssetCode = "native"; //selling asset code
    // const sellingAssetIssuer = "GDRXZH4H22HE4WKEYT54XFYWOMFH5XCP4ZXWN2RYWG4P7C4PZJ4H57TU"; //selling asset issuer
    // const buyingAssetCode = "CAT"; //buying asset
    // const buyingAssetIssuer = "GBHHU65KNWOSXH3HWPADXMONMIVDH4V4PRXSNBWFKVCEW27HEESJXZIH";
    // const amount = "2"; // Amount of buying asset to purchase
    // const price = "5"; // Price per unit of selling asset
    // const offerId = await createBuyOffer(sellingAssetCode, sellingAssetIssuer, buyingAssetCode, buyingAssetIssuer, amount, price);


  //updating the offer
    // const offerId = "4";
    // await updateBuyOffer(offerId, new Asset(sellingAssetCode, sellingAssetIssuer), new Asset(buyingAssetCode, buyingAssetIssuer), amount, price);

  //Delete the offer 
    const sellingAssetCode = "native"; // selling asset code
    const sellingAssetIssuer = "GDRXZH4H22HE4WKEYT54XFYWOMFH5XCP4ZXWN2RYWG4P7C4PZJ4H57TU"; // selling asset issuer
    const buyingAssetCode = "CAT"; // buying asset
    const buyingAssetIssuer = "GBHHU65KNWOSXH3HWPADXMONMIVDH4V4PRXSNBWFKVCEW27HEESJXZIH";
    const offerId = "6"; 
    await deleteBuyOffer(offerId, new Asset(sellingAssetCode, sellingAssetIssuer), new Asset(buyingAssetCode, buyingAssetIssuer));
})();
