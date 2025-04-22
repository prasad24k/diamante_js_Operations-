const {
    Asset,
    Networks,
    Aurora,
    BASE_FEE,
    Keypair,
    Operation,
    TransactionBuilder,
  } = require("diamnet-sdk");
  
  // ROOT ACCOUNT to Destination Account simple transaction
  const sourceSecret = "SAGJVK4DVUNZVYBORQHWZFCYKKCDISJFFJ2B3L5BER3WDBHQQNNI7NX5";
 //const sourceSecret = "SBNTKLQWUHDNNYBQ7VZVK2TSSXZ5PGYUNXKGOZWA4FIBNI5BX2VWLOCD";
 // const destinationSecret = "SBZM56J24QK7IHSUXXROFZSYFIIUG3IOWGXACML7DF42FRBNJWAY3VGS";
  
  async function OperationPaymentTest(secret) {
    const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");
    const sourceKeypair = Keypair.fromSecret(secret);
    const account = await server.loadAccount(sourceKeypair.publicKey());
   // const TokenAsset = new Asset ("TSKON","GBQYVC5XHICL3U3O6B3EP2A6TXX43NUU7XDPVX3E6LQ2W6U2EJ67JDPI")
    //const TokenAsset = new Asset("yDIAM", "GABD54Z4YI2AHW4E6UY77NKUFFSV2VU2CXZN7EOUEPVZKL6YLN2N743N");
    const TokenAsset =new Asset("DiamAi","GCLTAGCZVONPKLULSD4XZOMSJZSUVJYOK2SQQHD4KRNN3TZWXG57RG23")
    if (!account) {
      throw new Error("Source account not found");
    }
  
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase:Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination: "GC4T2V4VKSLXORALUSJAYQ4GBGHIRA7GMMQHXDKOMKQQFUWXB3CO7Q6N",
          asset: TokenAsset,
          amount: "1",
        })
      )
      .setTimeout(30)
      .build();
  
    tx.sign(sourceKeypair);
  
    const response = await server.submitTransaction(tx);
    if (response.successful) {
      console.log("Transaction successful", response.hash);
    } else {
      console.error("Transaction failed:", response.errorResultXdr);
    }
  }
  
  // // Token Transfer
  // async function TokenTransfer(sourceSecret, destinationSecret) {
  //   const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");
  //   const sourceKeypair = Keypair.fromSecret(sourceSecret);
  //   const destinationKeypair = Keypair.fromSecret(destinationSecret);
  //   const account = await server.loadAccount(sourceKeypair.publicKey());
  
  //   if (!account) {
  //     throw new Error("Source account not found");
  //   }
  
  //   const destination = destinationKeypair.publicKey();
  //   const TokenAsset = new Asset("YDIAM", "GC7DOCZIRBWWDZO53ZUN5YTKRWHHPEB7EECU5BL7XUYKTAGQGY6D4YSH");
  
  //   // Check if the destination account has a trustline for the TokenAsset
  //   const destinationAccount = await server.loadAccount(destination);
  //   const trustlineExists = destinationAccount.balances.some(
  //     (balance) => balance.asset_code === TokenAsset.code && balance.asset_issuer === TokenAsset.issuer
  //   );
  
  //   if (!trustlineExists) {
  //     // Create a trustline for the destination account
  //     const trustlineTx = new TransactionBuilder(destinationAccount, {
  //       fee: BASE_FEE,
  //       networkPassphrase: "Diamante Testnet 2024",
  //     })
  //       .addOperation(
  //         Operation.changeTrust({
  //           asset: TokenAsset,
  //         })
  //       )
  //       .setTimeout(30)
  //       .build();
  
  //     trustlineTx.sign(destinationKeypair); // Sign with the destination account's secret key
  
  //     const trustlineResponse = await server.submitTransaction(trustlineTx);
  //     if (!trustlineResponse.successful) {
  //       console.error("Trustline creation failed:", trustlineResponse.errorResultXdr);
  //       return;
  //     }
  //     console.log("Trustline created successfully", trustlineResponse.hash);
  //   }
  
  //   // Proceed with the token transfer
  //   const tx = new TransactionBuilder(account, {
  //     fee: BASE_FEE,
  //     networkPassphrase: "Diamante Testnet 2024",
  //   })
  //     .addOperation(
  //       Operation.payment({
  //         destination: destination,
  //         asset: TokenAsset,
  //         amount: "1", // Amount of asset to transfer
  //       })
  //     )
  //     .setTimeout(30)
  //     .build();
  
  //   tx.sign(sourceKeypair);
  
  //   const response = await server.submitTransaction(tx);
  //   if (response.successful) {
  //     console.log("Token transfer successful", response.hash);
  //   } else {
  //     console.error("Token transfer failed:", response.errorResultXdr);
  //   }
  // }
  
  (async () => {
    await OperationPaymentTest(sourceSecret);
    //await TokenTransfer(sourceSecret, destinationSecret);
  })();
  