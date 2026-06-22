const chatLog = document.getElementById("chatLog");
const sendBtn = document.getElementById("sendBtn");
const clearBtn = document.getElementById("clearBtn");
const chatMsg = document.getElementById("chatMsg");
const typing = document.getElementById("typing");
const alertsDiv = document.getElementById("alerts");
const aboutDiv = document.getElementById("about");
const micBtn = document.getElementById("micBtn");
const connectBtn = document.getElementById("connectBtn"); 

let lastIntent = null;

function addMessage(sender, text) {
  chatLog.innerHTML += `<div><strong>${sender}:</strong> ${text}</div>`;
  chatLog.scrollTop = chatLog.scrollHeight;
}

sendBtn.addEventListener("click", () => {
  const msg = chatMsg.value.trim();
  if (!msg) return;

  addMessage("🧑 You", msg);
  chatMsg.value = "";

  typing.style.display = "block";

  setTimeout(() => {
    typing.style.display = "none";
    let reply = "✨ I’m still learning!";

    
    if (msg.toLowerCase().includes("donate")) {
      lastIntent = "donate";
      reply = "Do you want to donate to NGOs or disaster relief?";
    } else if (lastIntent === "donate" && msg.toLowerCase().includes("ngo")) {
      reply = "To donate to an NGO, please connect your wallet and enter the amount 💸.";
      lastIntent = null;
    } else if (lastIntent === "donate" && msg.toLowerCase().includes("disaster")) {
      reply = "For disaster relief, select an active alert and confirm donation ✅.";
      lastIntent = null;
    } else if (msg.toLowerCase().includes("ngo")) {
      reply = "We have 200+ verified NGOs listed ✅.";
    } else if (msg.toLowerCase().includes("hello") || msg.toLowerCase().includes("hi")) {
      reply = "Hello 👋 How can I help you today?";
    }

    addMessage("🤖 Bot", reply);
    speakText(reply);
  }, 1000);
});

clearBtn.addEventListener("click", () => {
  chatLog.innerHTML = "✨ Welcome! Ask me about NGOs, donations, or disaster alerts.";
});

fetch("http://localhost:5000/api/alerts")
  .then(res => res.json())
  .then(data => {
    alertsDiv.innerHTML = data.join("<br>");
  })
  .catch(() => { alertsDiv.innerHTML = "⚠ Failed to load alerts."; });

fetch("http://localhost:5000/api/about")
  .then(res => res.json())
  .then(data => {
    aboutDiv.innerHTML = `<strong>${data.title}</strong><br>${data.desc}`;
  })
  .catch(() => { aboutDiv.innerHTML = "⚠ About info not available."; });

let recognition;
let listening = false;

function setupRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) { micBtn.disabled = true; return; }

  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (e) => {
    chatMsg.value = e.results[0][0].transcript;
    sendBtn.click();
  };

  recognition.onerror = () => { listening = false; micBtn.textContent = "🎤 Speak"; };
  recognition.onend = () => { listening = false; micBtn.textContent = "🎤 Speak"; };
}

setupRecognition();

micBtn.addEventListener("click", () => {
  if (!recognition) return;
  if (!listening) {
    recognition.start();
    listening = true;
    micBtn.textContent = "⏹ Stop";
  } else {
    recognition.stop();
    listening = false;
    micBtn.textContent = "🎤 Speak";
  }
});

function speakText(text) {
  if (!("speechSynthesis" in window)) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

let web3;
let userAccount;
const contractAddress = "0xa440cfb4216d45f44008790fa849911ae7804c48"; 
const abi = 
	[
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_donorId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_ngoId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_disasterId",
				"type": "string"
			}
		],
		"name": "donate",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "donationId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "donorId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "ngoId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "disasterId",
				"type": "string"
			}
		],
		"name": "DonationMade",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "donorId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			}
		],
		"name": "DonorRegistered",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "donorId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "status",
				"type": "bool"
			}
		],
		"name": "DonorVerified",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "ngoId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			}
		],
		"name": "NGORegistered",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "ngoId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "status",
				"type": "bool"
			}
		],
		"name": "NGOVerified",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_kycHash",
				"type": "string"
			}
		],
		"name": "registerDonor",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_regHash",
				"type": "string"
			}
		],
		"name": "registerNGO",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_donorId",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "_status",
				"type": "bool"
			}
		],
		"name": "verifyDonor",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_ngoId",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "_status",
				"type": "bool"
			}
		],
		"name": "verifyNGO",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "admin",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "donationCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "donations",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "donorId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "ngoId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "disasterId",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "donorCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "donorRewards",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "donors",
		"outputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "kycHash",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "isVerified",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_donationId",
				"type": "uint256"
			}
		],
		"name": "getDonation",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_donorId",
				"type": "uint256"
			}
		],
		"name": "getDonorRewards",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_ngoId",
				"type": "uint256"
			}
		],
		"name": "getNGOTotal",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "ngoCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "ngos",
		"outputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "regHash",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "isVerified",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "totalReceived",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}

];

let contract;


async function connectWallet() {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      userAccount = accounts[0];
      addMessage("✅ Wallet", `Connected: ${userAccount}`);
      web3 = new Web3(window.ethereum);
      contract = new web3.eth.Contract(abi, contractAddress);
    } catch (err) {
      addMessage("⚠ Wallet", "Connection failed.");
      console.error(err);
    }
  } else {
    addMessage("⚠ Wallet", "MetaMask not detected.");
  }
}

connectBtn.addEventListener("click", connectWallet);


async function donateToNGO(donorId, ngoId, disasterId, amountEth) {
  if (!contract || !userAccount) {
    addMessage("⚠ Blockchain", "Connect wallet first!");
    return;
  }
  const amountWei = web3.utils.toWei(amountEth.toString(), 'ether');
  try {
    await contract.methods.donate(donorId, ngoId, disasterId)
      .send({ from: userAccount, value: amountWei });
    addMessage("✅ Blockchain", `Donation of ${amountEth} ETH successful!`);
  } catch (err) {
    addMessage("⚠ Blockchain", "Transaction failed.");
    console.error(err);
  }
}
async function getBotReply(userMessage) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": "Bearer YOUR_OPENAI_API_KEY",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",  
      messages: [{ role: "user", content: userMessage }]
    })
  });
  const data = await response.json();
  return data.choices[0].message.content;
}
