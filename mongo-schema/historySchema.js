const mongoose = require("mongoose");

const schema = {
  term: String,
  url: String,
  description: String,
  date: Date,
};
module.exports = mongoose.model("history", schema);
