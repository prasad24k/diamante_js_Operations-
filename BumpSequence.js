//The Bump Sequence operation is useful for Managing account state , Avoiding transaction replays , Invalidate old or failed transactions , Securely manage the account’s transaction flow and prevent errors in blockchain transactions.
const { Aurora, Keypair, Operation, BASE_FEE, TransactionBuilder } = require("diamnet-sdk");

async function bumpSequence(sourceSecret) {
    const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");
    const sourceKeypair = Keypair.fromSecret(sourceSecret);

    try {
        // Load the source account
        const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());

        // Check and log the current sequence number
        console.log("Current sequence number:", sourceAccount.sequence);

        // Calculate the new sequence number to bump to (increment current sequence by 1)
        const bumpTo = (BigInt(sourceAccount.sequence) + BigInt(1)).toString();

        // Log the calculated bumpTo value
        console.log("Bumping sequence to:", bumpTo);

        // Build the transaction to bump the sequence number
        const tx = new TransactionBuilder(sourceAccount, {
            fee: BASE_FEE,
            networkPassphrase: "Diamante Testnet 2024",
        })
        .addOperation(Operation.bumpSequence({
            bumpTo: bumpTo // The new sequence number to bump to (calculated)
        }))
        .setTimeout(30)
        .build();

        // Sign the transaction
        tx.sign(sourceKeypair);

        // Submit the transaction
        const response = await server.submitTransaction(tx);
        
        if (response.successful) {
            console.log("Sequence bump successful.");
            // Load the account again to check the new sequence number after bumping
            const updatedAccount = await server.loadAccount(sourceKeypair.publicKey());
            console.log("Updated sequence number:", updatedAccount.sequence);
        } else {
            console.error("Transaction failed:", response);
        }
    } catch (error) {
        console.error("Transaction submission error:", error);
    }
}
const sourceSecret = "SBZM56J24QK7IHSUXXROFZSYFIIUG3IOWGXACML7DF42FRBNJWAY3VGS";

(async () => {
    await bumpSequence(sourceSecret);
})();
