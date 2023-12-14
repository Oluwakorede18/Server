const { Schema, default: mongoose } = require("mongoose");


const subsectionCollection =Schema( {
  section: String,
  details: Object,
  apiWord: String,
});
module.exports = mongoose.model("Subsection", subsectionCollection);

