const {
    Asset,
    Aurora,
    BASE_FEE,
    Operation,
    TransactionBuilder,
} = require("diamnet-sdk");

const publicKey = "GAVIQ3C7K3STES5FFZIXHGOAFRGBVNCMUNOL4WQZRD3OMSSUG4VTB7FG";
const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");

// Create Sell Offer to sell yDiam to Diam for TOKEN
async function createSellOffer(sellingAmount) {
    const account = await server.loadAccount(publicKey);
    const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: "Diamante Testnet 2024",
    })
        .addOperation(
            Operation.manageSellOffer({
                selling: new Asset("yDIAM", "GABD54Z4YI2AHW4E6UY77NKUFFSV2VU2CXZN7EOUEPVZKL6YLN2N743N"),
                buying: Asset.native(),
                amount: parseFloat(sellingAmount).toFixed(7), // Amount of Diam to sell
                price: parseFloat("1.0000000").toFixed(7), // Price per unit of YDIAM in Diam
                offerId: "0",
            })
        )
        .setTimeout(30)
        .build();

    // Generate the XDR without signing the transaction
    const xdr = transaction.toXDR();
    console.log("XDR:", xdr);

    return xdr;
}

(async () => {
    const sellingAmount = "3.0000000"; // Amount of Diam to sell
    await createSellOffer(sellingAmount);
})();
