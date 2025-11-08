const express = require("express");
const mongoose = require("mongoose");
const routes = require("./routes");

const app = express();
const PORT = 3001;

app.use(express.json());

app.use((req, res, next) => {
  req.user = {
    _id: "5d8b8592978f8bd833ca8133",
  };
  next();
});

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use(routes);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

mongoose.connect("mongodb://127.0.0.1:27017/wtwr_db");
