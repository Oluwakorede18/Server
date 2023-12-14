const {
  addUserInput,
  getGlossary,
  defineTerm,
  getSubsection,
  getConditionsByLetter,
  addToHistory,
  getHistory,
} = require("../services/words.service");
const { responseHandler } = require("../utils/responseHandler");
//   const { generateAccessToken } = require("../utils/token");
exports.userInput = async (req, res) => {
  try {
    // call create user service and pass request body (data)
    const check = await addUserInput(req.body);

    // check index 0 if true or false, if false return error message to client
    if (!check[0]) return responseHandler(res, check[1], 400, false, null);
    // else return success message
    return responseHandler(res, "Signup successful", 201, true, check[1]);
  } catch (error) {
    console.error(error);
    return responseHandler(res, "An error occurred. Server error", 500, false);
  }
};

exports.getGlossary = async (req, res) => {
  try {
    // call alphabetically service
    const check = await getGlossary();

    // check index 0 if true or false, if false return error message to client
    if (!check[0]) return responseHandler(res, check[1], 400, false, null);
    // else return success message
    return responseHandler(
      res,
      "Terms gotten successfully",
      201,
      true,
      check[1]
    );
  } catch (error) {
    console.error(error);
    return responseHandler(res, "An error occurred. Server error", 500, false);
  }
};

exports.defineTerm = async (req, res) => {
  try {
    // call create user service and pass request body (data)
    const check = await defineTerm(req.body.term);

    // check index 0 if true or false, if false return error message to client
    if (!check[0]) return responseHandler(res, check[1], 400, false, null);
    // else return success message
    return responseHandler(
      res,
      "Word retrived successfully",
      201,
      true,
      check[1]
    );
  } catch (error) {
    console.error(error);
    return responseHandler(res, "An error occurred. Server error", 500, false);
  }
};

exports.getSubsection = async (req, res) => {
  try {
    // call create user service and pass request body (data)
    const check = await getSubsection(req.params.section);

    // check index 0 if true or false, if false return error message to client
    if (!check[0]) return responseHandler(res, check[1], 400, false, null);
    // else return success message
    return responseHandler(
      res,
      "Section retrived successfully",
      201,
      true,
      check[1]
    );
  } catch (error) {
    console.error(error);
    return responseHandler(res, "An error occurred. Server error", 500, false);
  }
};
exports.getConditionsByLetter = async (req, res) => {
  try {
    // call create user service and pass request body (data)
    const check = await getConditionsByLetter(req.params.letter);

    // check index 0 if true or false, if false return error message to client
    if (!check[0]) return responseHandler(res, check[1], 400, false, null);
    // else return success message
    return responseHandler(
      res,
      "Conditions retrived successfully",
      201,
      true,
      check[1]
    );
  } catch (error) {
    console.error(error);
    return responseHandler(res, "An error occurred.", 500, false);
  }
};
exports.addHistory = async (req, res) => {
  try {
    // call create user service and pass request body (data)
    const check = await addToHistory(req.body);

    // check index 0 if true or false, if false return error message to client
    if (!check[0]) return responseHandler(res, check[1], 400, false, null);
    // else return success message
    return responseHandler(
      res,
      "History updated successfully",
      201,
      true,
      check[1]
    );
  } catch (error) {
    console.error(error);
    return responseHandler(res, "An error occurred. Server error", 500, false);
  }
};
exports.getHistory = async (req, res) => {
    try {
      // call create user service and pass request body (data)
      const check = await getHistory();
  
      // check index 0 if true or false, if false return error message to client
      if (!check[0]) return responseHandler(res, check[1], 400, false, null);
      // else return success message
      return responseHandler(
        res,
        "History retrieved successfully",
        201,
        true,
        check[1]
      );
    } catch (error) {
      console.error(error);
      return responseHandler(res, "An error occurred. Server error", 500, false);
    }
  };
