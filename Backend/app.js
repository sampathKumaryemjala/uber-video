const express = require("express");
const dotEnv = require("dotenv");
const userRoutes = require("./routes/user.routes");
const cookieParser = require("cookie-parser");

dotEnv.config();
const cors = require("cors");
const app = express();
const connectToDb = require("./db/db");

connectToDb();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use("/users", userRoutes);

module.exports = app;
