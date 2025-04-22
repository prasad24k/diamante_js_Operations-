const { Aurora, Keypair, Operation, BASE_FEE, TransactionBuilder } = require("diamnet-sdk");

async function setDataEntry(sourceSecret, key, value) {
    const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");
    const sourceKeypair = Keypair.fromSecret(sourceSecret);

    try {
        // Load the source account
        const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());

        // Build the transaction to set the data entry
        const tx = new TransactionBuilder(sourceAccount, {
            fee: BASE_FEE,
            networkPassphrase: "Diamante Testnet 2024",
        })
        .addOperation(Operation.manageData({
            name: key,   // The key (name) of the data entry
            value: value // The value of the data entry
        }))
        .setTimeout(30)
        .build();

        // Sign the transaction
        tx.sign(sourceKeypair);

        // Submit the transaction
        const response = await server.submitTransaction(tx);
        console.log("Data entry set:", response.hash);
    } catch (error) {
        console.error("Transaction submission error:", error);
    }
}

async function deleteDataEntry(sourceSecret, key) {
    const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");
    const sourceKeypair = Keypair.fromSecret(sourceSecret);

    try {
        // Load the source account
        const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());

        // Build the transaction to delete the data entry
        const tx = new TransactionBuilder(sourceAccount, {
            fee: BASE_FEE,
            networkPassphrase: "Diamante Testnet 2024",
        })
        .addOperation(Operation.manageData({
            name: key,  // The key of the data entry
            value: null  // Null value to delete the entry
        }))
        .setTimeout(30)
        .build();

        // Sign the transaction
        tx.sign(sourceKeypair);

        // Submit the transaction
        const response = await server.submitTransaction(tx);
        console.log("Data entry deleted:", response.hash);
    } catch (error) {
        console.error("Transaction submission error:", error);
    }
}

async function getDataEntries(sourcePublicKey) {
    const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");

    try {
        // Load the account
        const account = await server.loadAccount(sourcePublicKey);

        // Log the data entries (key-value pairs)
        console.log("Data entries for account:", account.data_attr);
    } catch (error) {
        console.error("Error loading account:", error);
    }
}

// Example usage
(async () => {
    const sourceSecret = "SAZNYHS73MGFUKUU4JTIXBZETWQGL7UJFPXTBOY4EAMX4HO35OJB2OLJ";
    const key = "prasadddd";
    const value = "darkMode=true"; // Example key-value pair

    // Set data entry
    //await setDataEntry(sourceSecret, key, value);

    // Get data entries
    const sourcePublicKey = "GDC5ZMDJX6CREOCQORHUTGEMBJE6ZLG3YCBNYGBRCXV5NGQSDBO7EGC3";
    await getDataEntries(sourcePublicKey);

    // Delete data entry
    const keyToDelete = "prasadddd"; // Key to delete
    await deleteDataEntry(sourceSecret, keyToDelete);
})();
