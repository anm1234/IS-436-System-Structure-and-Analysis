import express from "express";

const app = express();
const port = 3000;

app.listen(port, () =>{
    console.log(`Server is live on port ${port}`);
});

app.get("/", (req,res)=>{
    const members = {1: "Abel Negatu", 2:"Eman Hussien", 3: "Mareisha Banga", 
                    4: "Ryan Rich", 5: "Sahil Mohammed", 6: "Samuel Silva"};

    res.render("index.ejs", {members}) ;

})
