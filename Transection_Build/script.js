// //Sequence Number From Soure Account
// document
//   .getElementById("sourceAccount")
//   .addEventListener("change", async function () {
//     const sourceAccount = this.value;
//     try {
//       const response = await axios.get(
//         `/sequence?sourceAccount=${sourceAccount}`
//       );
//       document.getElementById("sequence").value = response.data.sequence;
//     } catch (error) {
//       alert("Error fetching sequence number. Please check the source account.");
//     }
//   });

// document
//   .getElementById("set-time-bounds")
//   .addEventListener("click", function () {
//     const now = Math.floor(Date.now() / 1000); // Current Unix timestamp in seconds
//     const fiveMinutesFromNow = now + 300; // 5 minutes = 300 seconds

//     document.getElementById("timeout").value = "0";
//     document.getElementById("lowerTimeBound").value = fiveMinutesFromNow;
//   });

// document
//   .getElementById("timeoutEnabled")
//   .addEventListener("change", function () {
//     const timeBoundInputs = document.getElementById("time-bound-inputs");
//     timeBoundInputs.style.display = this.checked ? "block" : "none";
//   });

// document
//   .getElementById("payment-asset-type")
//   .addEventListener("change", showAssetTypeFields);
// document
//   .getElementById("operation")
//   .addEventListener("change", showOperationInputs);

// function showOperationInputs() {
//   const operation = document.getElementById("operation").value;
//   document
//     .querySelectorAll(".dynamic-input")
//     .forEach((input) => (input.style.display = "none"));
//   document.getElementById(`${operation}-inputs`).style.display = "block";

//   if (operation === "payment") {
//     showAssetTypeFields();
//   }
// }

// function showAssetTypeFields() {
//   const assetType = document.getElementById("payment-asset-type").value;
//   const assetCodeIssuerFields = document.getElementById(
//     "asset-code-issuer-fields"
//   );

//   if (assetType === "native") {
//     assetCodeIssuerFields.style.display = "none";
//   } else {
//     assetCodeIssuerFields.style.display = "block";
//   }
// }

// function buildTransaction() {
//   const sourceAccount = document.getElementById("sourceAccount").value;
//   const sequence = document.getElementById("sequence").value;
//   const amount = document.getElementById("amount").value;
//   const baseFee = document.getElementById("baseFee").value;
//   const memo = document.getElementById("memo").value;
//   const timeoutEnabled = document.getElementById("timeoutEnabled").checked;
//   const timeout = document.getElementById("timeout").value;
//   const lowerTimeBound = document.getElementById("lowerTimeBound").value;
//   const operation = document.getElementById("operation").value;
//   const memotype = document.getElementById("memotype").value;

//   let baseArray = [{ sourceAccount }, { sequence }, { amount }, { baseFee }];

//   if (memo) {
//     baseArray.push({ memo });
//   }

//   if (timeoutEnabled) {
//     baseArray.push({ timeout });
//     baseArray.push({ lowerTimeBound });
//   }

//   let operationArray = [];

//   switch (operation) {
//     case "payment":
//       const paymentDestination = document.getElementById(
//         "payment-destination"
//       ).value;
//       const paymentAssetType =
//         document.getElementById("payment-asset-type").value;
//       const paymentAssetCode =
//         document.getElementById("payment-asset-code").value;
//       const paymentAssetIssuer = document.getElementById(
//         "payment-asset-issuer"
//       ).value;
//       const paymentAmount = document.getElementById("payment-amount").value;
//       operationArray.push({
//         paymentDestination,
//         paymentAssetType,
//         paymentAssetCode,
//         paymentAssetIssuer,
//         paymentAmount,
//       });
//       break;
//     case "createAccount":
//       const createAccountDestination = document.getElementById(
//         "createAccount-destination"
//       ).value;
//       const createAccountStartingBalance = document.getElementById(
//         "createAccount-startingBalance"
//       ).value;
//       operationArray.push({
//         createAccountDestination,
//         createAccountStartingBalance,
//       });
//       break;
//     case "manageData":
//       const manageDataName = document.getElementById("manageData-name").value;
//       const manageDataValue = document.getElementById("manageData-value").value;
//       operationArray.push({ manageDataName, manageDataValue });
//       break;
//     case "changeTrust":
//       const changeTrustAssetCode = document.getElementById(
//         "changeTrust-asset-code"
//       ).value;
//       const changeTrustAssetIssuer = document.getElementById(
//         "changeTrust-asset-issuer"
//       ).value;
//       const changeTrustLimit =
//         document.getElementById("changeTrust-limit").value;
//       operationArray.push({
//         changeTrustAssetCode,
//         changeTrustAssetIssuer,
//         changeTrustLimit,
//       });
//       break;
//     case "setOptions":
//       const setOptionsMasterWeight = document.getElementById(
//         "setOptions-master-weight"
//       ).value;
//       const setOptionsLowThreshold = document.getElementById(
//         "setOptions-low-threshold"
//       ).value;
//       const setOptionsMedThreshold = document.getElementById(
//         "setOptions-med-threshold"
//       ).value;
//       const setOptionsHighThreshold = document.getElementById(
//         "setOptions-high-threshold"
//       ).value;
//       const setOptionsSignerPublicKey = document.getElementById(
//         "setOptions-signer-public-key"
//       ).value;
//       const setOptionsSignerWeight = document.getElementById(
//         "setOptions-signer-weight"
//       ).value;
//       operationArray.push({
//         setOptionsMasterWeight,
//         setOptionsLowThreshold,
//         setOptionsMedThreshold,
//         setOptionsHighThreshold,
//         setOptionsSignerPublicKey,
//         setOptionsSignerWeight,
//       });
//       break;
//   }

//   let memoArray = [{ memotype }];
//   console.log("Operation data ",operationArray)
//   let mergedArray = [...baseArray, ...operationArray, ...memoArray];

//   console.log(mergedArray[0]);
//   console.log(mergedArray[7].paymentDestination);
//   // mergedArray.forEach(function (item) {
//   //   console.log(item);
//   //   console.log(item.sequence);
//   //   console.log(item.amount, "item amount");
//   // });
//   // Display the result
//   document.getElementById("result-blk").style.display = "block";
//   document.getElementById("result-btn-blk").style.display = "block";
//   document.getElementById("xdr-built").innerText =
//     "Transaction Built: " + JSON.stringify(mergedArray, 2);
// }

// function copyToClipboard() {
//   const xdrText = document.getElementById("xdr-built").innerText;
//   navigator.clipboard
//     .writeText(xdrText)
//     .then(() => {
//       alert("XDR copied to clipboard");
//     })
//     .catch((err) => {
//       console.error("Failed to copy: ", err);
//     });
// }

document
  .getElementById("sourceAccount")
  .addEventListener("change", async function () {
    const sourceAccount = this.value;
    try {
      const response = await axios.get(
        `/sequence?sourceAccount=${sourceAccount}`
      );
      document.getElementById("sequence").value = response.data.sequence;
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

    document.getElementById("timeout").value = "0";
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

async function _transactionBuilder(params) {
  const {
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
    memotype,
  } = params;

  if (_sourceAccount === "" || baseFee === "" || sequence === "") {
    return "Some parameters are not filled";
  }
  console.log("Params data:", params);
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
      return "Invalid operation specified";
  }

  if (timeout === "") {
    timeout = 180;
  }

  if (timeoutEnabled) {
    if (_lowerTimeBound === undefined) {
      return "Lower time bound is required when timeout is enabled";
    }
  } else {
    lowerTimeBound = _lowerTimeBound;
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
    memoObj = DiamSdk.Memo.hash(DiamSdk.hash("MyString").toString("hex"));
  }
  console.log("messseagg");
  try {
    const sourceAccount = await server.loadAccount(_sourceAccount);
    console.log("Source account:", sourceAccount);

    const transaction = new DiamSdk.TransactionBuilder(sourceAccount, {
      fee: baseFee,
      networkPassphrase: "Diamante Testnet",
      sequence: sequence,
      timebounds: { minTime: lowerTimeBound || 0, maxTime: upperTimeBound },
    })
      .addOperation(op)
      .addMemo(memoObj)
      .build();

    console.log("Transaction:", transaction);

    var content = transaction.toEnvelope().toXDR("base64");
    console.log("XDR content:", content);

    document.getElementById("result-blk").style.display = "block";
    document.getElementById("xdr-built").innerHTML =
      transaction.networkPassphrase;
    document.getElementById("xdr-result1").innerHTML = content;
    document.getElementById("result-btn-blk").style.display = "block";

    xdrBuilt = content;
    console.log("xdrBuilt:", xdrBuilt);
  } catch (error) {
    console.error("Error building transaction:", error);
  }
}

async function transactionBuilder(params) {
  const {
    _sourceAccount,
    sequence,
    amount,
    baseFee,
    memo,
    timeoutEnabled,
    _lowerTimeBound,
    _operation,
    data,
    memotype,
  } = params;

  var operation;

  console.log(
    "transactionBuilder called with:",
    _operation === "payment",
    data
  );

  switch (_operation) {
    case "payment":
      console.log("daaa", data);
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
        asset: customAsset,
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
          weight: data[5],
        },
      });
      break;

    default:
      return "Invalid operation specified";
  }

  //console.log("Operation:", operation);

  _transactionBuilder({
    _sourceAccount,
    sequence,
    amount,
    baseFee,
    memo,
    timeoutEnabled,
    _lowerTimeBound,
    operation,
    data: operation,
    memotype,
  });
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

  console.log(
    "buildTransaction called with:",
    sourceAccount,
    sequence,
    amount,
    baseFee,
    memo,
    timeout,
    timeoutEnabled,
    lowerTimeBound,
    operation,
    memotype
  );

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
  console.log("Data collected:", data);

  transactionBuilder({
    _sourceAccount: sourceAccount,
    sequence,
    amount,
    baseFee,
    memo,
    timeoutEnabled,
    _lowerTimeBound: lowerTimeBound,
    _operation: operation,
    data,
    memotype,
  });
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
