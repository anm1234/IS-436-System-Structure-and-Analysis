console.log("portfolio.js loaded");

// Portfolio price storage
let portfolioPrices = {};

// Detect which coins appear in the DOM
function detectCoins() {
  const rows = document.querySelectorAll(".portfolio-holding-list");
  const coins = [];

  rows.forEach(row => {
    let coin = row.querySelector(".coin").innerText.trim().toUpperCase(); 
    coin = coin + "-USD";  // <-- FIXES THE ISSUE
    coins.push(coin);
    portfolioPrices[coin] = null;
  });

  return coins;
}

const coinsToSubscribe = detectCoins();
console.log("Subscribing to:", coinsToSubscribe);

// ---------- WebSocket JUST for portfolio page ----------
const wsPortfolio = new WebSocket("wss://ws-feed.exchange.coinbase.com");

wsPortfolio.onopen = () => {
  console.log("Portfolio WebSocket connected.");

  wsPortfolio.send(
    JSON.stringify({
      type: "subscribe",
      channels: [
        {
          name: "ticker",
          product_ids: coinsToSubscribe
        }
      ]
    })
  );
};

wsPortfolio.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "ticker" && portfolioPrices.hasOwnProperty(data.product_id)) {
    portfolioPrices[data.product_id] = parseFloat(data.price);
  }
};

// ---------- UI Update Loop ----------
setInterval(() => {
  let totalPortfolioValue = 0;

  for (const coin in portfolioPrices) {
    const priceEl = document.querySelector(`.price-${coin}`);
    const amountEl = document.querySelector(`.amount-${coin}`);
    const totalEl = document.querySelector(`.total-${coin}`);

    if (!priceEl || !amountEl || !totalEl) continue;

    const price = portfolioPrices[coin];

    // Update current price
    if (price !== null) {
      priceEl.innerHTML = "$" + price.toFixed(4);
    }

    // Update total value
    const amount = Number(amountEl.innerText);
    if (!isNaN(amount) && price !== null) {
      const value = amount * price;
      totalEl.innerHTML = "$" + value.toFixed(4);
      totalPortfolioValue += value;
    }
  }

  // Update total portfolio value
  const totalDom = document.getElementById("portfolio-value");
  if (totalDom) {
    totalDom.innerHTML = "$" + totalPortfolioValue.toFixed(2);
  }

}, 200);
