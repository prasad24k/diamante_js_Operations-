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
const sourcePublicKey = "GCWIQSBS3GWZP2JL47NI2IONRW3GOZAXL57FDYF24IYG6XVJAUUJ67YO"; 
const fixedPriceNumerator = 1;
const fixedPriceDenominator = 1;
const buyAmount = "10";

const buyingAssetCode = "testOffer2";
const buyingAssetIssuer = "GAWI3ODXVVSWTHV2NI2K7CIWKFURHGP3DDBAEKDP65UBI3L6HQVWDY3N";

async function createBuyOfferXDR(amount) {
    try {
        if (Number(amount) <= 0) {
            throw new Error("Amount must be a positive number.");
        }

        const buyingAsset = new Asset(buyingAssetCode, buyingAssetIssuer); // ydiam asset
        const sellingAsset = Asset.native(); // Native asset (Diam)

        console.log("Creating buy offer to buy", amount, "of", buyingAssetCode);

        const account = await server.loadAccount(sourcePublicKey);

        // Check if the trustline exists for the buying asset (CAT)
        const trustlines = account.balances;
        const trustlineExists = trustlines.some(
            (balance) =>
                balance.asset_code === buyingAssetCode && balance.asset_issuer === buyingAssetIssuer
        );

        const transactionBuilder = new TransactionBuilder(account, {
            fee: BASE_FEE,
            networkPassphrase: Networks.TESTNET,
        });

        // If trustline does not exist for the buying asset, add operation to create trustline
        if (!trustlineExists) {
            transactionBuilder.addOperation(
                Operation.changeTrust({
                    asset: buyingAsset,
                })
            );
        }

        // create a buy offer
        transactionBuilder.addOperation(
            Operation.manageBuyOffer({
                buying: buyingAsset,
                selling: sellingAsset,
                buyAmount: parseFloat(amount).toFixed(7), 
                price: (fixedPriceNumerator / fixedPriceDenominator).toFixed(7), 
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

createBuyOfferXDR(buyAmount);
