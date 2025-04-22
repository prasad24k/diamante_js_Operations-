const { Aurora, Keypair } = require("diamnet-sdk");
const axios = require("axios");

document.getElementById("generateKeypairBtn").addEventListener("click", () => {
  const { publicKey, secret } = createKeypair();
  document.getElementById("publicKey").textContent = publicKey;
  document.getElementById("secretKey").textContent = secret;
  document.getElementById("keypairDisplay").classList.remove("hidden");
});
document
  .getElementById("fundAccountBtn")
  .addEventListener("click", async () => {
    const publicKey = document.getElementById("fundPublicKey").value;
    const fundStatus = document.getElementById("fundStatus");
    try {
      await fundAccount(publicKey);
      fundStatus.textContent = "Account funded successfully!";
      fundStatus.classList.add("success");
    } catch (error) {
      fundStatus.textContent = "Error funding account.";
      fundStatus.classList.add("error");
    }
    fundStatus.classList.remove("hidden");
  });
function createKeypair() {
  const keyPair = Keypair.random();
  return {
    publicKey: keyPair.publicKey(),
    secret: keyPair.secret(),
  };
}
async function fundAccount(publicKey) {
  const response = await axios.get(
    `https://friendbot.diamcircle.io/?addr=${publicKey}`
  );
  console.log("Account funded successfully", publicKey);
}
