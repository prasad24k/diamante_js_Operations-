const { ethers } = require("ethers");



const BSC_TESTNET_RPC_URL = "https://data-seed-prebsc-1-s1.binance.org:8545/";

const PRIVATE_KEY = "53e798bab8035b9eb7c4f3302ebf12b80c76cce01a9778e48dd642aa8d743818";

const TO_ADDRESS = "0x59cb4558016eEecD68D6e101F7C196c6e7b3Caa0";

const AMOUNT = "0.0001";



async function transferBNB() {

    try {

        const provider = new ethers.JsonRpcProvider(BSC_TESTNET_RPC_URL);

        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);



        const amountInWei = ethers.parseEther(AMOUNT);

        const feeData = await provider.getFeeData();

        const gasPrice = feeData.gasPrice;



        const nonce = await provider.getTransactionCount(wallet.address, "latest");

        const tx = {

            to: TO_ADDRESS,

            value: amountInWei,

            gasLimit: 21000,

            gasPrice: gasPrice,

            nonce: nonce,

            chainId: 97,

        };

        const txResponse = await wallet.sendTransaction(tx);

        await txResponse.wait();



        console.log(`Transfer Successful TX Hash: ${txResponse.hash}`);

    } catch (error) {

        console.error("Error transferring BNB:", error);

    }

}



transferBNB();

