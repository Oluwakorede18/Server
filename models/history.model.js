const { Schema, default: mongoose } = require("mongoose");

const historyCollection = Schema({
  termId: {
    type: Schema.Types.ObjectId,
    ref: "Glossary",
    required: true,
  },
  term: String,
  url: String,
  description: String,
  date: Date,
});

module.exports = mongoose.model("history", historyCollection);





