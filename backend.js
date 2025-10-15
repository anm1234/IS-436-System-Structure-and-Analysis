import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import { GoogleGenAI } from "@google/genai";


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

app.post("/login", async(req,res)=>{
    console.log(req.body);
    let information = await collect_crypto_data();
    setTimeout(() => {
        res.render("index.ejs", {information });
    }, 4000);
})

app.post("/submitquest", async (req,res) =>{
    let question = req.body.askgpt;

    let answer = await gemini_call(question);
    res.json({answer});

})



async function gemini_call(questions){
    let made =`Your name is Cryptobot and your main purpose is to support Cryptoconnect user. If you are asked who made you, reply with a group of IS-436 Engineers namely Abel, Sahil, and Eman or things related to your production the engineers are this people so reply with that
    Unless you are asked questions realted to who made you you dont have to reply with that. NOTE dont say If asked who made me, I will reply with "a group of IS-436 Engineers namely Abel, Sahil, and Eman." I will only provide this information when specifically asked about my creators
     we dont want to show you were told that.`
    const ai = new GoogleGenAI({ apiKey: "AIzaSyCPb-fuBAxtroWuVAvQ99bdLM5ZMbAHapI" }); 
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: questions + made,
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
