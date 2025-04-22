const { Asset, Aurora, Keypair, Operation, BASE_FEE, TransactionBuilder , Claimant } = require("diamnet-sdk");

async function createClaimableBalance(sourceSecret, destinationPublicKey) {
    const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");
    const sourceKeypair = Keypair.fromSecret(sourceSecret);

    try {
        // Load the source account
        const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());

        // Amount to lock in the claimable balance
        const amount = "5"; 

       // Creates a claimant object with an unconditional predicate, meaning the destination account can claim the balance without any additional conditions.
        const claimant = new Claimant(destinationPublicKey, Claimant.predicateUnconditional());

        // Create the claimable balance entry operation
        const claimableBalanceOp = Operation.createClaimableBalance({
            asset: Asset.native(), // Asset type (DIAM in this case)
            amount: amount, // Amount to lock in the claimable balance
            claimants: [claimant], // Add the claimant to the claimable balance
        });

        // Build the transaction
        const transaction = new TransactionBuilder(sourceAccount, {
            fee: BASE_FEE,
            networkPassphrase: "Diamante Testnet 2024", 
        })
            .addOperation(claimableBalanceOp)
            .setTimeout(30)
            .build();

        // Sign the transaction
        transaction.sign(sourceKeypair);

        // Submit the transaction
        const response = await server.submitTransaction(transaction);

        console.log("Transaction response:", response.hash);
    } catch (error) {
        console.error("Transaction submission error:", error);
    }
}

const sourceSecret = "SCYER7WUB3HQ3NK3YULVGVBP3FF6CGHUTPJ2YBI7LFGTP4XQZRPTENPO";
const destinationPublicKey = "GDC5ZMDJX6CREOCQORHUTGEMBJE6ZLG3YCBNYGBRCXV5NGQSDBO7EGC3";

(async () => {
    await createClaimableBalance(sourceSecret, destinationPublicKey);
})();
