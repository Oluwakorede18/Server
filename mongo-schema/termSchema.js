const mongoose = require("mongoose");

const termSchema = mongoose.Schema({
  term: {
    type: String,
  },
  apiLink: String,
});

// module.expoorts = mongoose.model('terms', wordSchema)

module.exports = mongoose.model("Terms", termSchema);
