window.onload = function() {
  history.pushState(null, null, window.location.href);
  history.back();
  window.onpopstate = () => history.forward();
};

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


// 1. Select all price elements
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

// 2. Select all volume elements
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

// 3. Store latest values
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

// 4. WebSocket connection
const ws = new WebSocket("wss://ws-feed.exchange.coinbase.com");

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: "subscribe",
    channels: [
      { name: "ticker", product_ids: Object.keys(latestPrices) }
    ]
  }));
};

// 5. Update live values from WebSocket
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "ticker" && data.product_id in latestPrices) {
    latestPrices[data.product_id] = data.price;
    latestVolume[data.product_id] = data.volume_24h;
  }
};

// 6. One interval for updating ALL UI
setInterval(() => {

  // A. Update homepage: prices & volumes
  for (const productId in latestPrices) {

    // Update price
    const priceValue = latestPrices[productId];
    if (priceValue) {
      const priceElement = prices[productId];
      if (priceElement) {
        priceElement.innerHTML = "$" + Number(priceValue).toFixed(6);
      }
    }

    // Update volume
    const volumeValue = latestVolume[productId];
    if (volumeValue) {
      const volumeElement = volume[productId];
      if (volumeElement) {
        volumeElement.innerHTML = Number(volumeValue).toLocaleString();
      }
    }
  }

  // B. Update portfolio page prices
  for (const symbol in symbolMap) {
    const productId = symbolMap[symbol];  // e.g., "BTC-USD"
    const currentPrice = latestPrices[productId];

    if (!currentPrice) continue;

    const portfolioElement = document.querySelector(".holding-price-" + symbol);

    if (portfolioElement) {
      portfolioElement.innerHTML = "$" + Number(currentPrice).toFixed(6);
    }
  }

}, 100);  // refresh rate 10 times/sec




//Script for the Trade.ejs file is below

const dropdown = document.querySelector(".selection");
const amountInput = document.querySelector(".trading-amount");
const priceInput = document.querySelector(".trading-price");
const valueDisplay = document.querySelector(".trading-value");

// Reusable calculation function
function updateTradeValue() {
    const selected = dropdown.value;
    const currentPrice = latestPrices[selected];

    // Update price field
    priceInput.value = currentPrice;

    // Calculate total
    const amount = Number(amountInput.value);
    const totalValue = amount * currentPrice;

    valueDisplay.innerHTML = `${totalValue}`;
}

// When dropdown changes
dropdown.addEventListener("change", updateTradeValue);

// When amount changes (typing, input, paste)
amountInput.addEventListener("input", updateTradeValue);

