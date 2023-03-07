const { MongoClient } = require("mongodb");
const uri = require("./mongoUri");

const client = new MongoClient(uri);
const db_name = "Medical_Terms";
const term_collection = "terms";
const history_collection = "histories";

const termsCollection = client.db(db_name).collection(term_collection);
const historiesCollection = client.db(db_name).collection(history_collection);

const connectToDatabse = async () => {
  try {
    await client.connect();
    console.log("connected");
  } catch (err) {
    console.error(`error ${err}`);
  }
};

module.exports = {
  connectToDatabse,
  client,
  termsCollection,
  historiesCollection,
};
