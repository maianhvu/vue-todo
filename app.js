const express = require('express');
const app = express();
path = require("path");

app.use("/public", express.static(__dirname + "/public"));

app.get("/",function(req,res){
  res.sendFile(path.join(__dirname+"/index.html"));
})

app.listen(3000,function(){
  console.log("listening on port 3000!");
})
