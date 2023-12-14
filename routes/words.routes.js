// const options = require("../nhsKey");
// const historySchema = require("../mongo-schema/historySchema");
// const conn = require("../mongodbConnect");
// const uri = require("../mongoUri");
// const mongoose = require("mongoose");
// const fetch = require("node-fetch");
// const adminSchema = require("../mongo-schema/adminSchema");
// const detailsSchema = require("../mongo-schema/detailsSchema");
// const termSchema = require("../mongo-schema/termSchema");
// const { ObjectId } = require("mongodb");

const router = require("express").Router();

//controllers
const {
  userInput,
  getGlossary,
  defineTerm,
  getSubsection,
  getConditionsByLetter,
  addHistory,
  getHistory
} = require("../controllers/words.controller");
// routes
router.post("/user-input", userInput);
router.get("/get-glossary", getGlossary);
router.post("/define/", defineTerm);
router.get("/subsection/:section", getSubsection);
router.get("/condition-list/:letter", getConditionsByLetter);
router.post("/addToGeneralHistory", addHistory);
router.get("/getHistory",getHistory)

module.exports = router;
