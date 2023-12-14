const { Schema, default: mongoose } = require("mongoose");

const detailsCollection =Schema( {
  apiWord: String,
  details: Object,
  createdAt: Date,
});

module.exports = mongoose.model("details", detailsCollection);
// export{mongoose.model("history")}

// export default { model };
