const express = require("express");
const dotEnv = require("dotenv");

dotEnv.config();
const cors = require("cors");
const app = express();

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

module.exports = app;
