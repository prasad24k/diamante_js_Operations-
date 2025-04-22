const { Aurora, Keypair, Operation, TransactionBuilder, BASE_FEE } = require("diamnet-sdk");

async function claimClaimableBalance(sourceSecret, balanceId) {
    const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");
    const sourceKeypair = Keypair.fromSecret(sourceSecret);

    try {
        // Load the source account
        const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());

        // Create the claim operation with the given BalanceID
        const claimOp = Operation.claimClaimableBalance({
            balanceId: balanceId, // The BalanceID of the claimable balance
        });

        // Build the transaction
        const transaction = new TransactionBuilder(sourceAccount, {
            fee: BASE_FEE,
            networkPassphrase: "Diamante Testnet 2024",
        })
            .addOperation(claimOp)
            .setTimeout(30)
            .build();

        // Sign the transaction
        transaction.sign(sourceKeypair);

        // Submit the transaction
        const response = await server.submitTransaction(transaction);

        console.log("Claim transaction response:", response.hash);
    } catch (error) {
        console.error("Transaction submission error:", error);
        console.error("Full error details:", JSON.stringify(error, null, 2));
    }
}

const sourceSecret = "SAZNYHS73MGFUKUU4JTIXBZETWQGL7UJFPXTBOY4EAMX4HO35OJB2OLJ"; // Your secret key for same as cleamed destination 
const balanceId = "00000000237f124f3f5536c430a4c7a2e86893902ff579dbeeedade8210117ee8f06348d"; // Your BalanceID

(async () => {
    await claimClaimableBalance(sourceSecret, balanceId);
})();
