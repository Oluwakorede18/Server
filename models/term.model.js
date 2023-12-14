const { Schema, default: mongoose } = require("mongoose");

const termsCollection = Schema({
  term: {
    type: String,
  },
  apiLink: String,
  createdAt:Date
});

// module.expoorts = mongoose.model('terms', wordSchema)

module.exports = mongoose.model("Terms", termsCollection);
