import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import session from "express-session";
import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'; 

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 4000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.json());


app.use(session({
  secret: "mysecretkey",
  resave: false,
  saveUninitialized: true
}))

app.get("/", (req,res)=>{
    res.sendFile( __dirname +"/index.html");
    console.log(req.session.user);
})

app.get("/index", async (req, res) => {
    //let information = await collect_crypto_data();
    res.render("index.ejs");
    console.log(req.session);
});


app.post("/login", async (req, res) => {
  const user_email = req.body.user_email;
  const user_pass = req.body.user_pass;

  const verified = await verifier(user_email, user_pass);
  console.log(`Verfied: ${verified}`);
  
  if (verified) {
    req.session.user = verified;
    res.json({ value: verified, redirect: "/index" });
  
  } else {
    res.json({value: verified });
  }
});

app.post("/signup", async (req,res) =>{

  let storage = req.body;
  console.log(storage.registration);
  let status = await register(storage);

  if (status){
    res.json({'values': true})
  }else{
    res.json({"values": false})
  }

})

app.post("/submitquest", async (req,res) =>{
    let question = req.body.askgpt;

    let answer = await gemini_call(question);
    res.json({answer});

})

app.get("/profile",(req,res)=>{
  const session_exist = session_checker(req);
  if (session_exist){
    res.render("profile.ejs",{user_info:req.session.user.data[0]});
    console.log("Switched to the profile navigation");
  }else{
    res.sendFile( __dirname +"/index.html");
  }
})

app.get("/dashboard", (req,res)=>{
  const session_exist = session_checker(req);
  if (session_exist){
    res.render("index.ejs");
  }else{
    res.sendFile( __dirname +"/index.html");
  }
})

app.get("/trade", (req,res)=>{
  const session_exist = session_checker(req);
  if (session_exist){
    console.log(`Switched to trade`)
    //let trading_options = collect_crypto_data();
    let trading_options = req.session.user.data[0];
    console.log(trading_options);
    res.render("trade.ejs",{trading_options});
  }else{
    res.sendFile( __dirname +"/index.html");
  }
})

app.post('/submittrade', async (req, res) => {
  const order = req.body;
  const user_status = req.session.user.data[0];
  const user_status_holding = req.session.user.holding;

  const amount = Number(order.amount);
  const price = Number(order.price);
  const total = amount * price;

  //BUY LOGIC
  if (order.order_type === "Buy") {

    if (total > user_status.balance) {
      console.log("You can't afford it");
      return res.json({ balance: false });
    }

    //UPDATE DATABASE
    await update_buy(order, user_status, user_status_holding);

    user_status.balance -= total;

    //SESSION UPDATE (HOLDINGS)
    let asset = user_status_holding.find(h => h.asset_name === order.crypto);

    if (asset) {
      asset.asset_amount += amount;
    } else {
      user_status_holding.push({
        asset_name: order.crypto,
        asset_amount: amount
      });
    }

    return res.json({ balance: true });
  }

  // SELL LOGIC
  if (order.order_type === "Sell") {

    const coin = user_status_holding.find(h => h.asset_name === order.crypto);

    if (!coin) {
      return res.json({ balance: false, coin: false });
    }

    if (amount > coin.asset_amount) {
      return res.json({ balance: false, coins: true });
    }
 
    await update_sell(order, user_status, user_status_holding);
   
    user_status.balance += total;
   
    coin.asset_amount -= amount;
    
    if (coin.asset_amount <= 0) {
      req.session.user.holding = user_status_holding.filter(
        h => h.asset_name !== order.crypto
      );
    }
    return res.json({ balance: true, coins: true });
  }
});

app.get("/portfolio",(req,res)=>{
  const session_exist = session_checker(req);
  if (session_exist){
    console.log(`Switched to Protfolio`);
    const holding_info = req.session.user.holding;
    console.log(holding_info);
    res.render("portfolio.ejs",{holding_info});
  }else{
    res.sendFile( __dirname +"/index.html");
  }
})

app.get("/logout", (req,res)=>{
  delete req.session.user;
  console.log("User logged out session is:");
  console.log(req.session.user);
  res.sendFile( __dirname +"/index.html");
})

app.listen(port,() =>{
    console.log(`Server is live on port ${port}`);
});

async function collect_crypto_data() {
  const url =
    "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=XRP,BTC,SOL,ETH,ADA,BNB,DOGE,SHIB,LTC,LINK,USDT,USDC,BUSD,DOT";

  // Declare variable outside the .then() chain
  let data;

  await fetch(url, {
    method: "GET",
    headers: {
      "X-CMC_PRO_API_KEY": process.env.CMC_KEY
    },
  })
    .then((response) => response.json())
    .then((json) => {
      data = {
          "BTC": json.data.BTC.quote.USD.price,
          "ETH": json.data.ETH.quote.USD.price,
          "BNB": json.data.BNB.quote.USD.price,
          "ADA": json.data.ADA.quote.USD.price,
          "SOL": json.data.SOL.quote.USD.price,
          "XRP": json.data.XRP.quote.USD.price,
          "DOT": json.data.DOT.quote.USD.price,
          "DOGE": json.data.DOGE.quote.USD.price,
          "SHIB": json.data.SHIB.quote.USD.price,
          "LTC": json.data.LTC.quote.USD.price,
          "LINK": json.data.LINK.quote.USD.price,
          "USDT": json.data.USDT.quote.USD.price,
          "USDC": json.data.USDC.quote.USD.price,
          "BUSD": json.data.BUSD.quote.USD.price
      }
    })
    .catch((err) => console.error("Fetch error:", err));

  return data;
}

async function verifier(user_email, user_password){

  let content;

  let checker = false;

  if (supabase) {
    const { data, error } = await supabase
    .from('users')
    .select('id,password,fname,balance,lname,email')
    .eq('email', user_email);
    console.log(data);

    if (data.length > 0 && data[0].password === user_password){
      console.log("matched");
      console.log(data[0].id)
      const holding = await user_asset(data[0].id)
      content = {data,holding}
      return content;
    } else {
      checker = false;
      return checker;
    }
  }
}


async function register(storage){
  let checker = false;

  if (supabase) {
    const { data, error } = await supabase
    .from('users')
    .insert({
      'email':storage.registration.email,
      'password': storage.registration.password,
      'fname' : storage.registration.fname,
      'lname' : storage.registration.lname,
      'balance' : 500
     });
    console.log(data);

    if(error){
      checker = false;
      console.log(error);
    }else{
      checker = true;
    }
    console.log(checker);
  }

  return checker;
}

function session_checker(request){
  if(request.session.user){
    return true;
  }else{
    return false;
  }

}

async function user_asset(id){
  if (supabase){
    const {data, error } = await supabase
    .from('Holding')
    .select('asset_amount, asset_name')
    .eq('user_id',id);

    return data;
  }else{
    console.log(`Unable to retrive data for use`)
  }
}


async function update_balance(userId, newBalance) {
  const { error } = await supabase
    .from("users")
    .update({ balance: newBalance }) 
    .eq("id", userId);              

  if (error) {
    console.log("Error updating balance:", error);
  } else {
    console.log(`Balance updated in DB for user ${userId}: ${newBalance}`);
  }
}

async function update_buy(order, user_status, user_status_holding) {
  console.log("BUY operation started");

  const userId = user_status.id;
  const assetName = order.crypto;
  const amount = Number(order.amount);
  const price = Number(order.price);
  const totalCost = amount * price;

  if (user_status.balance < totalCost) {
    console.log("Not enough balance");
    return;
  }
  const existing = user_status_holding.find(h => h.asset_name === assetName);

  if (existing) {
    const newAmount = Number(existing.asset_amount) + amount;

    await supabase
      .from("Holding")
      .update({ asset_amount: newAmount })
      .eq("user_id", userId)
      .eq("asset_name", assetName);

    console.log(`✔ Updated holding for ${assetName}: new amount = ${newAmount}`);
  } else {

    await supabase
      .from("Holding")
      .insert({
        user_id: userId,
        asset_name: assetName,
        asset_amount: amount,
      });

    console.log(`✔ Inserted new holding for ${assetName}: amount = ${amount}`);
  }

  const newBalance = user_status.balance - totalCost;
  await update_balance(userId, newBalance);

  console.log("BUY Completed");
}


async function update_sell(order, user_status, user_status_holding) {
  console.log("SELL operation started");

  const userId = user_status.id;
  const assetName = order.crypto;
  const amount = Number(order.amount);
  const price = Number(order.price);
  const totalValue = amount * price;

  const existing = user_status_holding.find(h => h.asset_name === assetName);
  const newAmount = Number(existing.asset_amount) - amount;

  
  await supabase
    .from("Holding")
    .update({ asset_amount: newAmount })
    .eq("user_id", userId)
    .eq("asset_name", assetName);

  console.log(`Updated holding after SELL: ${assetName} = ${newAmount}`);


  const newBalance = user_status.balance + totalValue;
  const fixedBalance = Number(newBalance.toFixed(2));
  await update_balance(userId, fixedBalance);

  console.log("SELL Completed");
}
