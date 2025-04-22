const { Aurora, Keypair, Operation, BASE_FEE, TransactionBuilder } = require("diamnet-sdk");

async function mergeAccounts(sourceSecret, destinationPublicKey) {
    const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");
    const sourceKeypair = Keypair.fromSecret(sourceSecret);

    try {
        // Load the source account
        const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());

        // Build the transaction
        const tx = new TransactionBuilder(sourceAccount, {
            fee: BASE_FEE,
            networkPassphrase: "Diamante Testnet 2024",
        })
        .addOperation(
            Operation.accountMerge({
                destination: destinationPublicKey,
            })
        )
        .setTimeout(30)
        .build();

        // Sign the transaction
        tx.sign(sourceKeypair);

        // Submit the transaction
        const response = await server.submitTransaction(tx);
        console.log("Transaction response:", response.hash);
    } catch (error) {
        console.error(
            "Transaction submission error:",
            error.response?.data?.extras?.result_codes || error
        );
    }
}


// Example usage
const sourceSecret = "SB2QW4K3GSBNMBXK2FBDI472W46DHDVG4FOOFVAEBNZVAQCRKGBZMI4Q";
const destinationPublicKey = "GDC5ZMDJX6CREOCQORHUTGEMBJE6ZLG3YCBNYGBRCXV5NGQSDBO7EGC3";


(async () => {
    await mergeAccounts(sourceSecret, destinationPublicKey);
})();
