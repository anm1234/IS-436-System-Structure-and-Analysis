import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import OpenAI from "openai";
import { createClient } from '@supabase/supabase-js'


const supabase = createClient('https://vsqzovvkryycokndxakm.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzcXpvdnZrcnl5Y29rbmR4YWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNTMyNDEsImV4cCI6MjA3NjkyOTI0MX0.xFfrxMPbWBwyuNHjJQjF4X6IujTpy5HJSUeWplFlt3U');


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.json());



app.listen(port, () =>{
    console.log(`Server is live on port ${port}`);
});

app.get("/", (req,res)=>{
    res.sendFile( __dirname +"/index.html");
})

app.get("/index", async (req, res) => {
    let information = await collect_crypto_data();
    res.render("index.ejs", { information });
});


app.post("/login", async (req, res) => {
    const user_email = req.body.user_email;
    const user_pass = req.body.user_pass;

    const verified = await verifier(user_email, user_pass);

    if (verified) {
        res.json({ value: verified, redirect: "/index" });
    } else {
        res.json({value: verified });
    }
});

app.post("/submitquest", async (req,res) =>{
    let question = req.body.askgpt;

    let answer = await gemini_call(question);
    res.json({answer});

})

async function gemini_call(questions){
    let made =`Your name is Cryptobot and your main purpose is to support Cryptoconnect user. If you are asked who made you, reply with a group of IS-436 Engineers namely Abel, Sahil, and Eman or things related to your production the engineers are this people so reply with that
    Unless you are asked questions realted to who made you you dont have to reply with that. NOTE dont say If asked who made me, I will reply with "a group of IS-436 Engineers namely Abel, Sahil, and Eman." I will only provide this information when specifically asked about my creators
     we dont want to show you were told that.`
    
     const client = new OpenAI({ apiKey: "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" }); 
    const response = await client.responses.create({
        model: "gpt-5",
        input: questions + made,
    });

    console.log(response.text);
    let mels  = response.text;

    return mels;
}

async function collect_crypto_data() {
  const url =
    "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=XRP,BTC,SOL,ETH,ADA,BNB,DOGE,SHIB,LTC,LINK,USDT,USDC,BUSD,DOT";

  // Declare variable outside the .then() chain
  let data;

  await fetch(url, {
    method: "GET",
    headers: {
      "X-CMC_PRO_API_KEY": "07fc5637-02cd-469e-8ab4-772de36def10"
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

  let checker = false;

  if (supabase) {
    const { data, error } = await supabase
    .from('users')
    .select('password,fname,balance')
    .eq('email', user_email);
    console.log(data);

    if (data.length > 0 && data[0].password === user_password){
      console.log("matched");
      checker = true;
    } else {
      checker = false;
    }
  }

  return checker;
}



