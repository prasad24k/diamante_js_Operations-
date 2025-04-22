const {
  Aurora,
  Keypair,
} = require("diamnet-sdk");
const axios = require("axios");

// Generating Key Pairs
function createKeypair() {
  const keyPair = Keypair.random();
  return {
    publicKey: keyPair.publicKey(),
    secret: keyPair.secret(),
  };
}
const { publicKey, secret } = createKeypair();
console.log("Public Key:", publicKey);
console.log("Secret:", secret);

// Fund the Account
async function fundAccount(publicKey) {
    const response = await axios.get(`https://friendbot.diamcircle.io/?addr=${publicKey}`);
    console.log("Account funded successfully", publicKey);
  }
fundAccount(publicKey).then(() => {
  const server = new Aurora.Server("https://diamtestnet.diamcircle.io/");
  server.loadAccount(publicKey)
    .then((account) => {
      console.log("Account Balance:", account.balances);
    })
    .catch((error) => {
      console.error("Error loading account:", error.message);
    });
});
