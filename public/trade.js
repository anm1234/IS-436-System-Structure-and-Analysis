window.onload = function() {
  history.pushState(null, null, window.location.href);
  history.back();
  window.onpopstate = () => history.forward();
};

let prices = {
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

const ws = new WebSocket("wss://ws-feed.exchange.coinbase.com");

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: "subscribe",
    channels: [
      {
        name: "ticker",
        product_ids: Object.keys(prices)
      }
    ]
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "ticker") {
    prices[data.product_id] = parseFloat(data.price);
  }
};

const selection = document.querySelector(".selection");
const amountInput = document.querySelector(".trading-amount");
const selectedPrice = document.querySelector(".trading-price");
const totalValue = document.querySelector(".trading-value");

// Update UI ONLY when user interacts
function updateUI() {
  const coin = selection.value;
  const price = prices[coin];
  const amount = parseFloat(amountInput.value);

  selectedPrice.value = price;

  totalValue.innerHTML = price * amount;
}

// User selects a coin → update once
selection.addEventListener("change", updateUI);

// User types amount → update
amountInput.addEventListener("input", updateUI);
