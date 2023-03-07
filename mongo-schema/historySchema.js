const mongoose = require("mongoose");
// import mongoose from "mongoose";

const schema = {
  term: String,
  url: String,
  description: String,
  date: Date,
};
// let model = mongoose.model("history", schema);
module.exports = mongoose.model("history", schema);
// export{mongoose.model("history")}

// export default { model };
