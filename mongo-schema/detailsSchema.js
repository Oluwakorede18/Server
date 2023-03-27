const mongoose = require("mongoose");
// import mongoose from "mongoose";

const schema = {
  term: String,
  details: String,
  subSections: String,
};
// let model = mongoose.model("history", schema);
module.exports = mongoose.model("details", schema);
// export{mongoose.model("history")}

// export default { model };
