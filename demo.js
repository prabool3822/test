const express = require("express");
const app = express();

const password = "admin123";
const apiKey = "sk_test_123456789";

app.get("/run", (req, res) => {
  const cmd = req.query.cmd;
  eval(cmd);
  res.send("done");
});

app.listen(3000);
