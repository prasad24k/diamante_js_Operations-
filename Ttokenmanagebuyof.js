const {
    Asset,
    Aurora,
    BASE_FEE,
    Keypair,
    Networks,
    Operation,
    TransactionBuilder,
} = require("diamnet-sdk");

const secret = "SAZNYHS73MGFUKUU4JTIXBZETWQGL7UJFPXTBOY4EAMX4HO35OJB2OLJ";
const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");

const sourceKeypair = Keypair.fromSecret(secret);
const sourcePublicKey = sourceKeypair.publicKey();

async function createBuyOffer(buyingAssetCode, buyingAssetIssuer,  amount, price) {
    try {
        if (Number(amount) <= 0 || Number(price) <= 0) {
            throw new Error("Amount and price must be positive numbers.");
        }

        const buyingAsset = new Asset(buyingAssetCode, buyingAssetIssuer);
        const sellingAsset =Asset.native() ;
        // const sellingAsset = sellingAssetCode === "native"
        //     ? Asset.native()
        //     : new Asset(sellingAssetCode, sellingAssetIssuer);

        console.log("Creating buy offer with amount:", amount, "and price:", price);

        const account = await server.loadAccount(sourcePublicKey);

        // Check if the trustline exists
        const trustlines = await server.loadAccount(sourcePublicKey).then(account => account.balances);
        const trustlineExists = trustlines.some(balance =>
            balance.asset_code === buyingAssetCode && balance.asset_issuer === buyingAssetIssuer
        );

        const transaction = new TransactionBuilder(account, {
            fee: BASE_FEE,
            networkPassphrase: Networks.TESTNET,
        });

        // If trustline does not exist, add operation to create trustline
        if (!trustlineExists) {
            transaction.addOperation(Operation.changeTrust({
                asset: buyingAsset,
            }));
        }

        // Add operation to create buy offer
        transaction.addOperation(Operation.manageBuyOffer({
            buying: buyingAsset,
            selling: sellingAsset,
            buyAmount: parseFloat(amount).toFixed(7),
            price: parseFloat(price).toFixed(7),
            offerId: "0",
        }));

        transaction.setTimeout(30);

        const builtTransaction = transaction.build();
        builtTransaction.sign(sourceKeypair);
        const result = await server.submitTransaction(builtTransaction);
        console.log("Buy offer created successfully...");
    } catch (error) {
        console.error("Error creating buy offer:", error);
        throw error;
    }
}

createBuyOffer("TDIAM", "GCT56NNNPUTAGN3FHDKY5QNLTXO2BBRYHO6457H4TXSHOOGX47KB2BLP", "10", "1")
    .catch(error => {
        console.error("Failed to create buy offer:", error);
    });
