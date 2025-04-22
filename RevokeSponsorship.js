const { Aurora, TransactionBuilder, Operation, Keypair, Networks, BASE_FEE, Asset } = require("diamnet-sdk");

const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");

// Function to create and sponsor a new account, then establish a trustline
async function CreateAndSponsorAccount(sponsorSecret) {
  const sponsorKeypair = Keypair.fromSecret(sponsorSecret); // Sponsor account
  const newKeypair = Keypair.random(); // Generate a new keypair for the account being sponsored

  try {
    // Load the sponsor account
    const sponsorAccount = await server.loadAccount(sponsorKeypair.publicKey());

    // Define the token asset
    const tokenAsset = new Asset("CAT", "GBHHU65KNWOSXH3HWPADXMONMIVDH4V4PRXSNBWFKVCEW27HEESJXZIH");

    // Build the transaction
    const transaction = new TransactionBuilder(sponsorAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      // Create the new account with a starting balance
      .addOperation(
        Operation.createAccount({
          destination: newKeypair.publicKey(),
          startingBalance: "5.0000000", // Minimum balance required for the new account
        })
      )
      // Begin sponsoring future reserves for the new account
      .addOperation(
        Operation.beginSponsoringFutureReserves({
          sponsoredId: newKeypair.publicKey(),
        })
      )
      // Establish a trustline for the CAT token
      .addOperation(
        Operation.changeTrust({
          source: newKeypair.publicKey(),
          asset: tokenAsset,
        })
      )
      .setTimeout(30)
      .build();

    // Sign the transaction with both the sponsor and the new account keys
    transaction.sign(sponsorKeypair, newKeypair);

    // Submit the transaction
    const transactionResult = await server.submitTransaction(transaction);
    console.log("Account creation and sponsorship successful!");
    console.log("New account public key:", newKeypair.publicKey());
    console.log("New account secret:", newKeypair.secret());
    return {
      publicKey: newKeypair.publicKey(),
      secret: newKeypair.secret(),
      transactionResult,
      trustlineAsset: tokenAsset,
    };
  } catch (error) {
    console.error("Error during account creation and sponsorship:", error.response?.data?.extras?.result_codes || error.message);
    throw error;
  }
}

// Function to revoke sponsorship
async function RevokeSponsorship(sponsorSecret, accountId, trustlineAsset) {
  const sponsorKeypair = Keypair.fromSecret(sponsorSecret); // Sponsor account

  try {
    // Load the sponsor account
    const sponsorAccount = await server.loadAccount(sponsorKeypair.publicKey());

    // Build the transaction to revoke sponsorship
    const transaction = new TransactionBuilder(sponsorAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.revokeSponsorship({
          ledgerKey: {
            trustline: {
              account: accountId, // The account whose trustline is being revoked
              asset: trustlineAsset, // The trustline asset (e.g., CAT token)
            },
          },
        })
      )
      .setTimeout(30)
      .build();

    // Sign the transaction
    transaction.sign(sponsorKeypair);

    // Submit the transaction
    const transactionResult = await server.submitTransaction(transaction);
    console.log("Sponsorship successfully revoked!");
    return transactionResult;
  } catch (error) {
    console.error("Error revoking sponsorship:", error.response?.data?.extras?.result_codes || error.message);
    throw error;
  }
}

// Main function to execute the workflow
(async () => {
  const sponsorSecret = "SCCBJCCIRBOU4SU7GIMGV5LUAIHTC7BSWVOSUCLZLA4OLKSCZLYZPG7R"; 
  const newAccount = await CreateAndSponsorAccount(sponsorSecret);

  console.log("New account created and sponsored:", newAccount.publicKey);

  // Revoke sponsorship of the trustline
  const revocationResult = await RevokeSponsorship(sponsorSecret, newAccount.publicKey, newAccount.trustlineAsset);
  console.log("Sponsorship revoked transaction hash:", revocationResult.hash);
})();
