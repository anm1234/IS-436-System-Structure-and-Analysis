window.onload = function() {
  history.pushState(null, null, window.location.href);
  history.back();
  window.onpopstate = () => history.forward();
};
// Script for the AI support chatbot


const form = document.getElementById("askForm");
const respond = document.querySelector(".response");

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const question = form.askgpt.value;

    const parent = document.querySelector(".ai")

    const responding = document.createElement("p");
    const userask = document.createElement("p");

    userask.classList.add("user-question");
    responding.classList.add("response");
    responding.textContent = "Thinking... 🤔";


    userask.innerHTML = question; 
    parent.appendChild(userask);
    parent.appendChild(responding);

    fetch("/submitquest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ askgpt: question })
    })
    .then(res => res.json())
    .then(data => {
        responding.innerHTML = "AI response: " + data.answer;
        form.reset();
    })
    .catch(err => {
        console.error(err);
        responding.innerHTML = "Error fetching response";
    });
});


const prices = {
  "BTC-USD": document.querySelector(".BTC-price"),
  "ETH-USD": document.querySelector(".ETH-price"),
  "BNB-USD": document.querySelector(".BNB-price"),
  "ADA-USD": document.querySelector(".ADA-price"),
  "SOL-USD": document.querySelector(".SOL-price"),
  "XRP-USD": document.querySelector(".XRP-price"),
  "DOT-USD": document.querySelector(".DOT-price"),
  "DOGE-USD": document.querySelector(".DOGE-price"),
  "SHIB-USD": document.querySelector(".SHIB-price"),
  "USDT-USD": document.querySelector(".USDT-price")
};

// Volume DOM elements
const volume = {
  "BTC-USD": document.querySelector(".BTC-vol"),
  "ETH-USD": document.querySelector(".ETH-vol"),
  "BNB-USD": document.querySelector(".BNB-vol"),
  "ADA-USD": document.querySelector(".ADA-vol"),
  "SOL-USD": document.querySelector(".SOL-vol"),
  "XRP-USD": document.querySelector(".XRP-vol"),
  "DOT-USD": document.querySelector(".DOT-vol"),
  "DOGE-USD": document.querySelector(".DOGE-vol"),
  "SHIB-USD": document.querySelector(".SHIB-vol"),
  "USDT-USD": document.querySelector(".USDT-vol")
};

// Latest price data
let latestPrices = {
  "BTC-USD": null,
  "ETH-USD": null,
  "BNB-USD": null,
  "ADA-USD": null,
  "SOL-USD": null,
  "XRP-USD": null,
  "DOT-USD": null,
  "DOGE-USD": null,
  "SHIB-USD": null,
  "USDT-USD": null
};

// Latest volume data
let latestVolume = {
  "BTC-USD": null,
  "ETH-USD": null,
  "BNB-USD": null,
  "ADA-USD": null,
  "SOL-USD": null,
  "XRP-USD": null,
  "DOT-USD": null,
  "DOGE-USD": null,
  "SHIB-USD": null,
  "USDT-USD": null
};

// Coinbase WebSocket
const ws = new WebSocket("wss://ws-feed.exchange.coinbase.com");

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: "subscribe",
    channels: [
      {
        name: "ticker",
        product_ids: Object.keys(latestPrices)
      }
    ]
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "ticker" && data.product_id in latestPrices) {
    latestPrices[data.product_id] = Number(data.price);
    latestVolume[data.product_id] = Number(data.volume_24h);
  }
};

// Update UI every 100ms
setInterval(() => {

  for (const coin in latestPrices) {

    // PRICE update
    if (latestPrices[coin] !== null) {
      if (prices[coin]) {
        prices[coin].innerHTML = "$" + latestPrices[coin].toFixed(1);
      }
    }

    // VOLUME update
    if (latestVolume[coin] !== null) {
      if (volume[coin]) {
        volume[coin].innerHTML = latestVolume[coin].toLocaleString();
      }
    }
  }

}, 100);




