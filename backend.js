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
const port = 3000;

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
    console.log(`Verfied: ${verified}`)
    console.log(req.session.user);

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
    res.render("profile.ejs",{user_info:req.session.user[0]});
    console.log("Switched to the profile navigation");
    console.log(req.session.user[0]);
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
    let trading_options = collect_crypto_data();
    res.render("trade.ejs",{trading_options});
  }else{
    res.sendFile( __dirname +"/index.html");
  }
})

app.get("/portfolio",(req,res)=>{
  const session_exist = session_checker(req);
  if (session_exist){
    res.render("portfolio.ejs");
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

app.listen(port, () =>{
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
    .select('id,password,fname,balance,lname,email')
    .eq('email', user_email);
    console.log(data);

    if (data.length > 0 && data[0].password === user_password){
      console.log("matched");
      return data;
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





