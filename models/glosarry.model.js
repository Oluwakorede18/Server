const { Schema, default: mongoose } = require("mongoose");

const glossaryCollection = Schema({
  term: String,
  desc: String,
  tag: String,
});

module.exports = mongoose.model("Glossary", glossaryCollection);


