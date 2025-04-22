const express = require('express');
const DiamSdk = require('diamnet-sdk');
const app = express();
const port = 3000;

// Ensure the server URL is correct
const serverUrl = "https://diamtestnet.diamcircle.io/";
const server = new DiamSdk.Aurora.Server(serverUrl);

async function getAccountSequenceNumber(sourceAccount) {
  try {
    const accountInfo = await server.loadAccount(sourceAccount);
    const sequenceNumber = accountInfo.sequenceNumber();

    console.log(
      `Sequence number for account ${sourceAccount}: ${sequenceNumber}`
    );
    return sequenceNumber;
  } catch (error) {
    console.error("Error fetching account details:", error);
    throw error;
  }
}

app.use(express.static('.'));

app.get('/sequence', async (req, res) => {
  const sourceAccount = req.query.sourceAccount;
  try {
    const sequenceNumber = await getAccountSequenceNumber(sourceAccount);
    res.json({ sequence: sequenceNumber });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching sequence number' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
