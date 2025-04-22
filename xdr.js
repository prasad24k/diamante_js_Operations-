const {
    Asset,
    Aurora,
    BASE_FEE,
    Networks,
    Operation,
    Server,
    TransactionBuilder,
} = require("diamnet-sdk");

const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");
const sourcePublicKey = "GDHUVIY6V4DJ55YVLC5MJSFFJ675KHX3XJCNWGUYG6EBMV72NN3FONZE";

// Define variables for amount and price
const buyAmount = "10";
const buyPrice = "1";

async function createBuyOfferXDR(buyingAssetCode, buyingAssetIssuer, amount, price) {
    try {
        if (Number(amount) <= 0 || Number(price) <= 0) {
            throw new Error("Amount and price must be positive numbers.");
        }

        const buyingAsset = new Asset(buyingAssetCode, buyingAssetIssuer);
        const sellingAsset = Asset.native();

        console.log("Creating buy offer with amount:", amount, "and price:", price);

        const account = await server.loadAccount(sourcePublicKey);
        const trustlines = account.balances;
        const trustlineExists = trustlines.some(
            (balance) =>
                balance.asset_code === buyingAssetCode && balance.asset_issuer === buyingAssetIssuer
        );

        const transactionBuilder = new TransactionBuilder(account, {
            fee: BASE_FEE,
            networkPassphrase: Networks.TESTNET,
        });
        if (!trustlineExists) {
            transactionBuilder.addOperation(
                Operation.changeTrust({
                    asset: buyingAsset,
                })
            );
        }
        transactionBuilder.addOperation(
            Operation.manageBuyOffer({
                buying: buyingAsset,
                selling: sellingAsset,
                buyAmount: parseFloat(amount).toFixed(7),
                price: parseFloat(price).toFixed(7),
                offerId: "0",
            })
        );

        transactionBuilder.setTimeout(30);
        const transaction = transactionBuilder.build();
        const transactionXDR = transaction.toXDR();
        console.log("Generated Transaction XDR:", transactionXDR);

        return transactionXDR;
    } catch (error) {
        console.error("Error creating buy offer transaction XDR:", error);
        throw error;
    }
}

// Example Usage
createBuyOfferXDR(
    "CAT",
    "GBHHU65KNWOSXH3HWPADXMONMIVDH4V4PRXSNBWFKVCEW27HEESJXZIH",
    buyAmount,
    buyPrice
)

