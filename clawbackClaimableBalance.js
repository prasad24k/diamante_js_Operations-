const { Aurora, Keypair, Operation, BASE_FEE, TransactionBuilder } = require("diamnet-sdk");
const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");

const sourceSecret = "SCYER7WUB3HQ3NK3YULVGVBP3FF6CGHUTPJ2YBI7LFGTP4XQZRPTENPO";
const sourceKeypair = Keypair.fromSecret(sourceSecret);

async function clawbackClaimableBalance() {
    try {
        // Fetch the source account to sign the transaction
        const account = await server.loadAccount(sourceKeypair.publicKey());
        console.log('Account loaded:', account);

        // Define the claimableBalanceId
        const claimableBalanceId = "00000000e4df5b625ebcfd1fa16a95b20f26763a03c99373d8cefbf152b0639f99c6a964";
        console.log("Using ClaimableBalanceId:", claimableBalanceId);

        // Create the transaction to claw back the claimable balance
        const transaction = new TransactionBuilder(account, {
            fee: BASE_FEE,
            networkPassphrase: "Diamante Testnet 2024",  // Replace with actual network passphrase
        })
            .addOperation(Operation.clawbackClaimableBalance({
                claimableBalanceId: claimableBalanceId,
            }))
            .setTimeout(30)  // Set a timeout for the transaction
            .build();

        // Sign the transaction with the source account's keypair
        transaction.sign(sourceKeypair);
        console.log('Transaction signed.');

        // Submit the transaction
        const result = await server.submitTransaction(transaction);
        console.log('Clawback Transaction Result:', result);

    } catch (error) {
        console.error('Error during clawback:', error);
    }
}

// Call the function with a specific ClaimableBalance ID
clawbackClaimableBalance();
