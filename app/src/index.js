import Web3 from "web3";
import starNotaryArtifact from "../../build/contracts/StarNotary.json";

const App = {
  web3: null,
  account: null,
  meta: null,

  start: async function () {
    try {
      this.web3 = await this.initializeWeb3();
      this.meta = await this.initializeContract();
      this.account = await this.getAccount();
    } catch (error) {
      console.error("Could not connect to contract or chain:", error);
    }
  },

  initializeWeb3: async function () {
    if (window.ethereum) {
      // Request additional permissions
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [
          {
            eth_accounts: {}
          }
        ]
      });

      // Use MetaMask's provider
      return new Web3(window.ethereum);
    } else {
      console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live");
      // Fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      return new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"));
    }
  },

  initializeContract: async function () {
    const { web3 } = this;
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = starNotaryArtifact.networks[networkId];

    if (!deployedNetwork) {
      throw new Error("Contract not deployed on the detected network.");
    }

    return new web3.eth.Contract(starNotaryArtifact.abi, deployedNetwork.address);
  },

  getAccount: async function () {
    const accounts = await this.web3.eth.getAccounts();
    return accounts[0];
  },

  setStatus: function (message) {
    const toast = document.getElementById("toast");
    toast.innerText = message;
    toast.style.display = "block";
    setTimeout(() => (toast.style.display = "none"), 3000); // Hide after 3 seconds
  },

  createStar: async function () {
    try {
      const { createStar } = this.meta.methods;
      const name = document.getElementById("starName").value;
      const id = document.getElementById("starId").value;
      await createStar(name, id).send({ from: this.account });
      this.setStatus("New Star Owner is " + this.account + ".");
    } catch (error) {
      console.error("Error creating star:", error);
    }
  },

  lookUp: async function () {
    try {
      const lookid = document.getElementById("lookid").value;
      this.setStatus("getElementById " + lookid + ".");
      const { lookUpTokenIdToStar } = this.meta.methods;
      const star = await lookUpTokenIdToStar(lookid).call();
      this.setStatus("Star name " + star);
    } catch (error) {
      console.error("Error looking up star:", error);
    }
  },
};

window.App = App;

window.addEventListener("load", async function () {
  try {
    await App.start();
  } catch (error) {
    console.error("Error initializing app:", error);
  }
});
