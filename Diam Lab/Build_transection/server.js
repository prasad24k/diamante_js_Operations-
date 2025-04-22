const server = new DiamSdk.Aurora.Server("https://diamtestnet.diamcircle.io/");

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

document
  .getElementById("sourceAccount")
  .addEventListener("change", async function () {
    const sourceAccount = this.value;
    try {
      const sequenceNumber = await getAccountSequenceNumber(sourceAccount);
      document.getElementById("sequence").value = sequenceNumber;
    } catch (error) {
      alert("Error fetching sequence number. Please check the source account.");
    }
  });

document.getElementById("operation").addEventListener("change", function () {
  const operation = this.value;
  document
    .querySelectorAll(".dynamic-input")
    .forEach((input) => (input.style.display = "none"));
  document.getElementById(`${operation}-inputs`).style.display = "block";
});

document
  .getElementById("payment-asset-type")
  .addEventListener("change", function () {
    const assetType = this.value;
    const assetCodeIssuerFields = document.getElementById(
      "asset-code-issuer-fields"
    );

    if (assetType === "native") {
      assetCodeIssuerFields.style.display = "none";
    } else {
      assetCodeIssuerFields.style.display = "block";
    }
  });

document
  .getElementById("set-time-bounds")
  .addEventListener("click", function () {
    const now = Math.floor(Date.now() / 1000); // Current Unix timestamp in seconds
    const fiveMinutesFromNow = now + 300; // 5 minutes = 300 seconds

    document.getElementById("timeout").value = fiveMinutesFromNow;
    document.getElementById("lowerTimeBound").value = fiveMinutesFromNow;
  });

document
  .getElementById("timeoutEnabled")
  .addEventListener("change", function () {
    const timeBoundInputs = document.getElementById("time-bound-inputs");
    if (this.checked) {
      timeBoundInputs.style.display = "block";
    } else {
      timeBoundInputs.style.display = "none";
    }
  });

async function _trasnactionBuilder(
  _sourceAccount,
  sequence,
  amount,
  baseFee,
  memo,
  timeout,
  timeoutEnabled,
  _lowerTimeBound,
  operation,
  data,
  memotype
) {
  try {
    console.log(
      "Called  ",
      _sourceAccount === "",
      baseFee === "",
      sequence === ""
    );
    var op;
    var upperTimeBound = 0;
    var lowerTimeBound = 0;

    if (_sourceAccount === "" || baseFee === "" || sequence === "") {
      console.log(12);
      return "Some parameters are not filled";
    }

    switch (operation) {
      case "payment":
      case "createAccount":
      case "manageData":
      case "changeTrust":
      case "setOptions":
        op = data;
        break;

      default:
        return "Invalid operation specified";
    }
    console.log(op);
    console.log(1);

    if (timeout === "") {
      timeout = 180;
    }

    if (timeoutEnabled) {
      if (_lowerTimeBound === undefined) {
        console.log(13);
        return "Lower time bound is required when timeout is enabled";
      }
    } else {
      lowerTimeBound = _lowerTimeBound;
      upperTimeBound = Math.ceil(Date.now() / 1000) + timeout;
    }

    console.log(2, memotype);

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

    const sourceAccount = await server.loadAccount(_sourceAccount);
    console.log(3);

    const transaction = new DiamSdk.TransactionBuilder(sourceAccount, {
      fee: baseFee,
      networkPassphrase: "Diamante Testnet",
      sequence: sequence,
      timebounds: { minTime: lowerTimeBound || 0, maxTime: upperTimeBound },
    })
      .addOperation(op)
      .addMemo(memoObj)
      .build();

    console.log("Transaction XDR:");
    console.log(transaction.toEnvelope().toXDR("base64"));
    console.log(
      transaction.toEnvelope().toXDR("base64"),
      transaction.networkPassphrase,
      transaction
    );

    var content = transaction.toEnvelope().toXDR("base64");

    document.getElementById("result-blk").style.display = "block";
    document.getElementById("xdr-built").innerHTML =
      transaction.networkPassphrase;
    document.getElementById("xdr-result1").innerHTML = content;
    document.getElementById("result-btn-blk").style.display = "block";

    xdrBuilt = content;
  } catch (error) {
    document.getElementById("result-blk").style.backgroundColor = "#ff4d4463";
    document.getElementById("result-btn-blk").style.color = "red";
    document.getElementById("result-blk").style.backgroundColor = "#ff4d4463";
    document.getElementById("result-btn-blk").style.color = "red";

    document.getElementById("xdr-built").innerHTML = error;

    console.log(error);
  }
}

async function trasnactionBuilder(
  _sourceAccount,
  sequence,
  amount,
  baseFee,
  memo,
  timeout,
  timeoutEnabled,
  _lowerTimeBound,
  _operation,
  data,
  memotype
) {
  var operation;

  console.log(_operation, " main", data[1], data[2]);
  
  switch (_operation) {
    case "payment":
      console.log("payment", data[0], data[1]);

      if (data[1] === "native") {
        if (data.length < 4) {
          return "Invalid data for payment operation";
        }

        operation = DiamSdk.Operation.payment({
          destination: data[0],
          asset: DiamSdk.Asset.native(),
          amount: data[3],
        });
      } else if (data[1] === "alphanumeric4" || data[1] === "alphanumeric12") {
        if (data.length < 5) {
          return "Invalid data for payment operation";
        }

        const customAsset = new DiamSdk.Asset(data[2], data[3]);

        operation = DiamSdk.Operation.payment({
          destination: data[0],
          asset: customAsset,
          amount: data[4],
        });
      }
      break;
    case "createAccount":
      console.log("Create account", data[0], data[1]);
     
      if (data.length < 2) {
        return "Invalid data for createAccount operation";
      }

      operation = DiamSdk.Operation.createAccount({
        destination: data[0],
        startingBalance: data[1].toString(),
      });
      break;

    case "manageData":
      if (data.length < 2) {
        return "Invalid data for manageData operation";
      }

      operation = DiamSdk.Operation.manageData({
        name: data[0],
        value: data[1],
      });
      break;

    case "changeTrust":
      if (data.length < 3) {
        return "Invalid data for changeTrust operation";
      }

      let customAsset = new DiamSdk.Asset(data[0], data[1]);

      operation = DiamSdk.Operation.changeTrust({
        asset: customAsset, //DiamSdk.Asset.native(),
        limit: data[2],
      });
      break;

    case "setOptions":
      if (data.length < 6) {
        return "Invalid data for setOptions operation";
      }

      operation = DiamSdk.Operation.setOptions({
        masterWeight: data[0],
        lowThreshold: data[1],
        medThreshold: data[2],
        highThreshold: data[3],
        signer: {
          ed25519PublicKey: data[4],
          weight: data[5], // Set the weight as needed
        },
      });
      break;

    default:
      return "Invalid operation specified";
  }

  _trasnactionBuilder(
    _sourceAccount,
    sequence,
    amount,
    baseFee,
    memo,
    timeoutEnabled,
    _lowerTimeBound,
    _operation,
    operation,
    memotype
  );
}

function buildTransaction() {
  const sourceAccount = document.getElementById("sourceAccount").value;
  const sequence = document.getElementById("sequence").value;
  const amount = document.getElementById("amount").value;
  const baseFee = document.getElementById("baseFee").value;
  const memo = document.getElementById("memo").value;
  const timeout = document.getElementById("timeout").value;
  const timeoutEnabled = document.getElementById("timeoutEnabled").checked;
  const lowerTimeBound = document.getElementById("lowerTimeBound").value;
  const operation = document.getElementById("operation").value;
  const memotype = document.getElementById("memotype").value;

  let data = [];

  switch (operation) {
    case "payment":
      data.push(document.getElementById("payment-destination").value);
      data.push(document.getElementById("payment-asset-type").value);
      if (data[1] !== "native") {
        data.push(document.getElementById("payment-asset-code").value);
        data.push(document.getElementById("payment-asset-issuer").value);
      }
      data.push(document.getElementById("payment-amount").value);
      break;
    case "createAccount":
      data.push(document.getElementById("createAccount-destination").value);
      data.push(document.getElementById("createAccount-startingBalance").value);
      break;
    case "manageData":
      data.push(document.getElementById("manageData-name").value);
      data.push(document.getElementById("manageData-value").value);
      break;
    case "changeTrust":
      data.push(document.getElementById("changeTrust-asset-code").value);
      data.push(document.getElementById("changeTrust-asset-issuer").value);
      data.push(document.getElementById("changeTrust-limit").value);
      break;
    case "setOptions":
      data.push(document.getElementById("setOptions-master-weight").value);
      data.push(document.getElementById("setOptions-low-threshold").value);
      data.push(document.getElementById("setOptions-med-threshold").value);
      data.push(document.getElementById("setOptions-high-threshold").value);
      data.push(document.getElementById("setOptions-signer-public-key").value);
      data.push(document.getElementById("setOptions-signer-weight").value);
      break;
  }

  trasnactionBuilder(
    sourceAccount,
    sequence,
    amount,
    baseFee,
    memo,
    timeoutEnabled,
    operation,
    data,
    memotype
  );
}

function copyToClipboard() {
  const content = document.getElementById("xdr-result1").innerText;
  navigator.clipboard
    .writeText(content)
    .then(() => {
      alert("XDR copied to clipboard");
    })
    .catch((err) => {
      console.error("Failed to copy: ", err);
    });
}
