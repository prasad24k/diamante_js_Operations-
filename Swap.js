const {
  Asset,
  Aurora,
  BASE_FEE,
  Keypair,
  Operation,
  TransactionBuilder,
} = require("diamnet-sdk");
const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");

async function swapDiam() {
    const privateKey = 'SCJLBDCCRC7WAUSLE7M7VZWMRDZ5KY7RJDXG5G6LNRZBPJBDX7OJ6KRF'; //private key
    const publicKey = Keypair.fromSecret(privateKey).publicKey();
    const sendAmount = 5.0; //amount you want to send
        //defines two assets: the native Diamante asset (DIAM) and a custom token asset (VIS).
        const questAccount = await server.loadAccount(publicKey);
        const diamAsset = Asset.native();
        const TokenAsset = new Asset(
            "WOLF",
            "GAUOYFQZUERFKOXKUCE2BBVYLR6C6NG2OBCGA4GU6X67C6OJKLFCHY5E"
        );
        const poolId = "440027a4a8ce095f9f2c606dde7fd789fd7c2f7e5c1f1f681aef818bef417cac"; 

        //checks if the account has a trustline for the custom token (VIS). If not, it creates one. A trustline is necessary for the account to hold the custom token.
        const accountLines = await server.loadAccount(publicKey);
        let hasTrustline = false;
        for (let line of accountLines.balances) {
            if (
                line.asset_code === TokenAsset.code &&
                line.asset_issuer === TokenAsset.issuer
            ) {
                hasTrustline = true;
                break;
            }
        }
        if (!hasTrustline) {
            const trustTransaction = new TransactionBuilder(
                questAccount,
                {
                    fee: BASE_FEE,
                    networkPassphrase:"Diamante Testnet 2024",
                }
            )
                .addOperation(
                    Operation.changeTrust({
                        asset: TokenAsset,
                    })
                )
                .setTimeout(0)
                .build();

            trustTransaction.sign(Keypair.fromSecret(privateKey));
            await server.submitTransaction(trustTransaction);
        }
        //fetches the liquidity pool details for the DIAM-VIS trading pair to understand the current reserves of both assets in the pool.
        const pool = await server
            .liquidityPools()
            .liquidityPoolId(poolId)
            .call();

        const reserveA = parseFloat(pool.reserves[0].amount); // DIAM reserve
        const reserveB = parseFloat(pool.reserves[1].amount); // Token reserve
        //calculates the amount of tokens that can be received for a specified amount of DIAM, applying a 2% slippage tolerance.
        const swappedAmount = (sendAmount * reserveB) / (reserveA + sendAmount);
        const minToken = (swappedAmount * 0.98).toFixed(7); // Applying a 98% buffer

        const transaction = new TransactionBuilder(questAccount, {
            fee: BASE_FEE,
            networkPassphrase:"Diamante Testnet 2024",
        })
            .addOperation(
                Operation.pathPaymentStrictSend({
                    sendAsset: diamAsset,// The asset that is being sent.
                    sendAmount: sendAmount.toFixed(7),
                    destination: publicKey,
                    destAsset: TokenAsset,
                    destMin: minToken,
                    path: [diamAsset],//An array of assets that define the path through which the payment will be routed. In this case, it's a direct path through the DIAM asset.
                })
            )
            .setTimeout(0)
            .build();

        transaction.sign(Keypair.fromSecret(privateKey));
        await server.submitTransaction(transaction);
        console.log("Swap successfully..................")
    } 
swapDiam();

/*
Operation->changeTrust: Creates a trustline for a specific asset.
Operation->pathPaymentStrictSend: Performs a path payment,
converting one asset into another through a liquidity pool, 
with parameters to specify the assets, amounts, recipient, and slippage tolerance.
 */