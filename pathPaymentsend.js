const {
    Asset,
    Aurora,
    BASE_FEE,
    Keypair,
    Operation,
    Networks,
    TransactionBuilder,
  } = require("diamnet-sdk"); // Import necessary modules from Diamnet SDK
const server = new Aurora.Server("https://diamtestnet.diamcircle.io/"); 

// Sender's secret key
const sourceSecretKey = 'SAHQFVZQYMYOBEIKITXMOO4PRUFD2I4BG5HHZGLND42YDGXTQL6FDEHR';
const sourceKeypair = Keypair.fromSecret(sourceSecretKey);

// Destination public key
const destinationId = 'GBFJMVT7EFW6JDUBAIAFQ52J5QULLU6KHRBI4VJEDQUH26ZVKNBETCWD';

server
  .loadAccount(sourceKeypair.publicKey())
  .then((sourceAccount) => {
    const transaction = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.pathPaymentStrictSend({
          sendAsset: Asset.native(), // Sending native diams
          sendAmount: '10', // Amount to send
          destination: destinationId,
          destAsset: new Asset('yDIAM', 'GABD54Z4YI2AHW4E6UY77NKUFFSV2VU2CXZN7EOUEPVZKL6YLN2N743N'), // Destination asset
          destMin: '1', // Minimum acceptable amount of the destination asset
          path: [], // Optional: specify intermediate assets
        })
      )
      .setTimeout(180)
      .build();

    transaction.sign(sourceKeypair);
    return server.submitTransaction(transaction);
  })
  .then((result) => {
    console.log('Transaction successful');
  })
  .catch((error) => {
    console.error('Transaction failed:', error);
  });
