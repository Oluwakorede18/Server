const glossaryModel = require("../models/glosarry.model");
const termsModel = require("../models/term.model");
const subsectionModel = require("../models/subsection.model");
const historyModel = require("../models/history.model");
const { translateError } = require("../utils/mongo_helper");
const { sortByFrequency } = require("../utils/sortByFrequency");

exports.addUserInput = async (body) => {
  try {
    const { input } = body;
    return [true, input];
  } catch (error) {
    console.log(error);
    return [false, translateError(error) || "Unable to get input"];
  }
};
exports.getGlossary = async () => {
  try {
    const terms = await glossaryModel.find().select({ _id: 0 });
    return [true, terms];
  } catch (error) {
    return [false, translateError(error) || "Unable to get input"];
  }
};
exports.defineTerm = async (term) => {
  try {
    // const { term } = body;
    if(term === 'x ray'){
      term = "x-ray"
    }
    const pipeline = [
      {
        $match: {
          term,
        },
      },
      {
        $lookup: {
          from: "details",
          localField: "apiLink",
          foreignField: "apiWord",
          as: "definition",
        },
      },
      {
        $project: {
          _id: 0,
          "definition.details": 1,
        },
      },
    ];
    const result = await termsModel.aggregate(pipeline);
    console.log(result);
    definitionArray = result[0].definition;
    console.log(definitionArray);

    const indexToRemove = definitionArray.findIndex(
      (obj) => obj.name === "Acne"
    );

    if (indexToRemove !== -1) {
      definitionArray.splice(indexToRemove, 1);
    }

    return [true, definitionArray];
  } catch (error) {
    console.log(error);
    if(error.includes('undefined')){
      return   [false,"Unable to find term definition"]
    }
    return [false, translateError(error) || "Unable to get input"];
  }
};
exports.getSubsection = async (section) => {
  try {
    const sectionDetails = await subsectionModel
      .find({ section })
      .select({ _id: 0 });
    return [true, sectionDetails];
  } catch (error) {
    console.log(error);
    return [false, translateError(error) || "Unable to get input"];
  }
};
exports.getConditionsByLetter = async (letter) => {
  try {
    const conditions = await glossaryModel
      .find({ tag: letter })
      .select({ _id: 0 });

      console.log(conditions)
    return [true, conditions];
  } catch (error) {
    console.log(error);
    return [false, translateError(error) || "Unable to get input"];
  }
};
exports.addToHistory = async (body) => {
  try {
    const { term } = body;
    const pipeline = [
      {
        $match: {
          term,
        },
      },
      {
        $lookup: {
          from: "glossaries",
          localField: "term",
          foreignField: "term",
          as: "history",
        },
      },
      {
        $project: {
          _id: 0,
          "history.term": 1,
          "history.desc": 1,
        },
      },
      {
        $addFields: {
          term: { $arrayElemAt: ["$history.term", 0] },
          description: { $arrayElemAt: ["$history.desc", 0] },
          date: new Date(),
        },
      },
      {
        $project: {
          history: 0, // Exclude the 'history' field from the output
        },
      },

      {
        $merge: {
          into: "histories",
          whenMatched: "keepExisting",
          whenNotMatched: "insert",
        },
      },
    ];
    const result = await glossaryModel.aggregate(pipeline);
    // console.log(result);
    // console.log(pipeline);
    return [true];
  } catch (error) {
    console.log(error);
    return [false, translateError(error) || "Unable to get input"];
  }
};
exports.getHistory = async () => {
  try {
    const history = await historyModel.find().select({ _id: 0 });

    let newArray = [];
    history.forEach((e) => {
      newArray.push(e.term);
    });
    result = sortByFrequency(newArray);

    const historyList = [];
    for (const e of result) {
      const term = await glossaryModel.find({ term: e.term }).select("desc");
      e.desc = term[0].desc;
      historyList.push(e);
    }

    // console.log(historyList);
    return [true, historyList];
  } catch (error) {
    console.log(error);
    return [false, translateError(error) || "Unable to get input"];
  }
};
