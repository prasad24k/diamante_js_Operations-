document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("sourceAccount").addEventListener("change", async function () {
      const sourceAccount = this.value;
      try {
          const response = await axios.get(`/sequence?sourceAccount=${sourceAccount}`);
          document.getElementById("sequence").value = response.data.sequence;
      } catch (error) {
          alert("Error fetching sequence number. Please check the source account.");
      }
  });

  document.getElementById("operation").addEventListener("change", function () {
      const operation = this.value;
      document.querySelectorAll(".dynamic-input").forEach((input) => (input.style.display = "none"));
      document.getElementById(`${operation}-inputs`).style.display = "block";
  });

  document.getElementById("payment-asset-type").addEventListener("change", function () {
      const assetType = this.value;
      const assetCodeIssuerFields = document.getElementById("asset-code-issuer-fields");

      if (assetType === "native") {
          assetCodeIssuerFields.style.display = "none";
      } else {
          assetCodeIssuerFields.style.display = "block";
      }
  });

  document.getElementById("set-time-bounds").addEventListener("click", function () {
      const now = Math.floor(Date.now() / 1000); // Current Unix timestamp in seconds
      const fiveMinutesFromNow = now + 300; // 5 minutes = 300 seconds

      document.getElementById("timeout").value = "0";
      document.getElementById("lowerTimeBound").value = fiveMinutesFromNow;
  });

  document.getElementById("timeoutEnabled").addEventListener("change", function () {
      const timeBoundInputs = document.getElementById("time-bound-inputs");
      if (this.checked) {
          timeBoundInputs.style.display = "block";
      } else {
          timeBoundInputs.style.display = "none";
      }
  });

  document.getElementById("build-transaction").addEventListener("click", async function () {
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

      try {
          const response = await axios.post('/build-transaction', {
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
          });

          document.getElementById("result-blk").style.display = "block";
          document.getElementById("xdr-built").innerHTML = response.data.xdr;
          document.getElementById("result-btn-blk").style.display = "block";
      } catch (error) {
          document.getElementById("result-blk").style.backgroundColor = "#ff4d4463";
          document.getElementById("result-btn-blk").style.color = "red";
          document.getElementById("xdr-built").innerHTML = error.response.data.error;

          console.error(error);
      }
  });

  document.getElementById("copy-to-clipboard").addEventListener("click", function () {
      const content = document.getElementById("xdr-built").innerText;
      navigator.clipboard
          .writeText(content)
          .then(() => {
              alert("XDR copied to clipboard");
          })
          .catch((err) => {
              console.error("Failed to copy: ", err);
          });
  });
});
