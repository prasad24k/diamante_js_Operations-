const express = require('express');
const axios = require('axios');
const DiamSdk = require('diamnet-sdk');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/sequence', async (req, res) => {
    const { sourceAccount } = req.query;
    try {
        const response = await axios.get(`https://diamtestnet.diamcircle.io/accounts/${sourceAccount}`);
        res.json({ sequence: response.data.sequence });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching sequence number' });
    }
});

app.post('/build-transaction', async (req, res) => {
    const {
        sourceAccount,
        sequence,
        amount,
        baseFee,
        memo,
        timeout,
        timeoutEnabled,
        lowerTimeBound,
        operation,
        data,
        memotype
    } = req.body;

    try {
        const xdr = await buildTransaction(
            sourceAccount,
            sequence,
            amount,
            baseFee,
            memo,
            timeout,
            timeoutEnabled,
            lowerTimeBound,
            operation,
            data,
            memotype
        );
        res.json({ xdr });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

async function buildTransaction(
    sourceAccount,
    sequence,
    amount,
    baseFee,
    memo,
    timeout,
    timeoutEnabled,
    lowerTimeBound,
    operation,
    data,
    memotype
) {
    try {
        if (sourceAccount === "" || baseFee === "" || sequence === "") {
            throw new Error("Some parameters are not filled");
        }

        var op;
        var upperTimeBound = 0;
        var lowerTimeBound = 0;

        switch (operation) {
            case "payment":
            case "createAccount":
            case "manageData":
            case "changeTrust":
            case "setOptions":
                op = data;
                break;

            default:
                throw new Error("Invalid operation specified");
        }

        if (timeout === "") {
            timeout = 180;
        }

        if (timeoutEnabled) {
            if (lowerTimeBound === undefined) {
                throw new Error("Lower time bound is required when timeout is enabled");
            }
        } else {
            lowerTimeBound = lowerTimeBound;
            upperTimeBound = Math.ceil(Date.now() / 1000) + timeout;
        }

        var memoObj;

        if (memotype === "empty") {
            memoObj = DiamSdk.Memo.text("");
        } else if (memotype === "text") {
            memoObj = DiamSdk.Memo.text(memo);
        } else if (memotype === "id") {
            memoObj = DiamSdk.Memo.id(memo.toString());
        } else if (memotype === "hash") {
            memoObj = DiamSdk.Memo.hash(DiamSdk.hash("yourString").toString("hex"));
        }

        const server = new DiamSdk.Horizon.Server("https://diamtestnet.diamcircle.io/");
        const sourceAccountObj = await server.loadAccount(sourceAccount);

        const transaction = new DiamSdk.TransactionBuilder(sourceAccountObj, {
            fee: baseFee,
            networkPassphrase: "Diamante Testnet",
            sequence: sequence,
            timebounds: { minTime: lowerTimeBound || 0, maxTime: upperTimeBound },
        })
            .addOperation(op)
            .addMemo(memoObj)
            .build();

        const content = transaction.toEnvelope().toXDR("base64");
        console.log("Transaction XDR:", content);
        return content;
    } catch (error) {
        throw error;
    }
}

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
