const fs = require("fs/promises");
const express = require("express");
const cors = require("cors");
// const MongoClient = require('mongodb').MongoClient

const options = {
  method: "GET",
  headers: {
    "subscription-key": "43e55ca57680434c97ca55eda1e450dd",
  },
};
// const bodyParser =  require('body-parser');

// const cors=require("cors");

const app = express();
const router = express.Router();

app.use(express.json());

app.use(cors());

app.use(express.static("public"));

app.post("/user-input", async (req, res) => {
  console.log("in post");
  const input = req.body.input;

  res.json(input);
});

app.listen(3000, () => console.log("running"));
