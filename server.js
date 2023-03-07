const fs = require("fs/promises");
const express = require("express");
const cors = require("cors");
const http = require("http");
const options = require("./nhsKey");
const historySchema = require("./mongo-schema/historySchema");
const conn = require("./mongodbConnect");
const fetch = require("node-fetch");
const uri = require("./mongoUri");
const mongoose = require("mongoose");

const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cors());
app.use(express.static("public"));

app.post("/user-input", async (req, res) => {
  console.log("in post");
  const input = req.body.input;

  res.json(input);
});
app.post("/alphabetically", async (req, res) => {
  const letter = req.body.letter;
  try {
    const response = await fetch(
      `https://api.nhs.uk/conditions/?category=${letter}&orderBy=dateModified&synonyms=false`,
      options
    );
    const data = await response.json();

    var terms = [];
    let information = data.significantLink;

    information.forEach((element) => {
      terms.push(element.name);
    });
    res.send(terms);
  } catch (error) {
    let errorMsg = {
      error:
        "Sorry, we could not perform this operation because of a problem with your internet connection. Please check your internet connection and try again",
    };

    res.json(errorMsg);
  }
});
app.post("/meaning", async (req, res) => {
  let apiWord;
  const value = req.body.term;
  const dbConnect = async (value) => {
    const documentToFind = { term: value };
    try {
      await conn.connectToDatabse();

      let result = await conn.termsCollection.findOne(documentToFind);
      apiWord = result.apiLink;
    } catch (err) {
      console.error(`error ${err}`);
    } finally {
      conn.client.close();
    }
  };

  try {
    mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    getWordInfo();
  } catch (err) {
    res.send(err);
    // console.error("error :", err);
    // res.redirect('/error');
    error = {
      error:
        "Sorry, we could not perform this operation because of a problem with your internet connection. Please check your internet connection and try again.t",
    };
    // res.send(err);
  }

  async function getWordInfo() {
    await dbConnect(value);
    try {
      const response = await fetch(
        `https://api.nhs.uk/conditions/${apiWord}`,
        options
      );
      if (response.status >= 400 && response.status < 600) {
        throw new Error(
          "Sorry, we could not find the word you are looking for in our dictionary. Please check your spelling or try searching for a different word."
        );
      }
      console.log(response.status);
      const data = await response.json();

      const content = new historySchema({
        term: value,
        url: data.url,
        description: data.description,
        date: new Date(),
      });

      const val = await content.save();
      let meaning = {};
      let details = [];
      let links = [];

      let info = data.mainEntityOfPage;
      let linkInfo = data.relatedLink;

      let count = 0;
      linkInfo.forEach((e) => {
        links.push({
          id: count,
          name: e.name,
          url: e.url,
        });
        count++;
      });

      //Loops through the main entity of page array
      info.forEach((e) => {
        let pageInfo = e.hasPart;
        pageInfo.forEach((element) => {
          let empty = "";
          let undefined = "undefined";
          //Loops through details in the second mainEntity array
          if (
            empty.localeCompare(element.headline) == 0 ||
            undefined.localeCompare(element.headline) == 0
          ) {
            if (
              empty.localeCompare(element.text) != 0 &&
              undefined.localeCompare(element.text) != 0
            ) {
              let checkText = element.text;
              let checked = checkText.indexOf("src");
              if (checked == -1) {
                details.push({
                  text: element.text,
                });
              }
            }
          } else {
            if (
              empty.localeCompare(element.text) != 0 &&
              undefined.localeCompare(element.text) != 0
            ) {
              let checkText = element.text;
              let checked = checkText.indexOf("src");
              if (checked == -1) {
                details.push({
                  headline: element.headline,
                  text: element.text,
                });
              }
            }
          }
        });
      });

      meaning = { links, details };
      res.json(meaning);
    } catch (err) {
      // console.log(
      //   "No results found, check spelling or try to another search term."
      // );
      // console.log(err)
      let errorMsg = {
        error:
          "Sorry, we could not find the word you are looking for in our dictionary. Please check your spelling or try searching for a different word.",
      };

      res.json(errorMsg);

      // if (error.toString().includes("TypeError")) {
      //   console.log("network issue");
      // } else if (error.toString().includes("Bad")) {
      //   console.log("spelling");
      // }

      // console.log(error + "pop");
    }
  }
});
app.post("/info", async (req, res) => {
  const url = req.body.url;
  const response = await fetch(url, options);
  const data = await response.json();

  let meaning = {};
  let details = [];
  let links = [];

  let info = data.mainEntityOfPage;
  let linkInfo = data.relatedLink;

  linkInfo.forEach((e) => {
    links.push({
      name: e.name,
      url: e.url,
    });
  });
  //Loops through the main entity of page array
  info.forEach((e) => {
    let pageInfo = e.hasPart;
    pageInfo.forEach((element) => {
      let empty = "";
      let undefined = "undefined";
      //Loops through details in the second mainEntity array
      if (
        empty.localeCompare(element.headline) == 0 ||
        undefined.localeCompare(element.headline) == 0
      ) {
        if (
          empty.localeCompare(element.text) != 0 &&
          undefined.localeCompare(element.text) != 0
        ) {
          let checkText = element.text;
          let checked = checkText.indexOf("src");
          if (checked == -1) {
            details.push({
              text: element.text,
            });
          }
        }
      } else {
        if (
          empty.localeCompare(element.text) != 0 &&
          undefined.localeCompare(element.text) != 0
        ) {
          let checkText = element.text;
          let checked = checkText.indexOf("src");
          if (checked == -1) {
            // console.log(element.text);
            details.push({
              headline: element.headline,
              text: element.text,
            });
          }
        }
      }
    });
  });

  meaning = { links, details };
  res.json(meaning);
});
app.get("/history", async (req, res) => {
  var data = [];
  let historyUnsorted = [];

  const dbConnect = async () => {
    try {
      await conn.connectToDatabse();

      // let result = await conn.historiesCollection.distinct("term",conn.historiesCollection.aggregate([{ $sort: {
      //     term: -1
      //      }
      //   }]))

      let result = await conn.historiesCollection
        .aggregate([
          {
            $group: {
              _id: {
                term: "$term",
                date: "$date",
                url: "$url",
                desc: "$description",
              },
            },
          },
        ])
        .toArray();
      data = result;
    } catch (err) {
      console.error(`error ${err}`);
      let errorMsg = {
        error:
          "Sorry, we could not perform this operation because of a problem with your internet connection. Please check your internet connection and try again",
      };

      res.json(errorMsg);
    } finally {
      conn.client.close();
    }
  };

  async function getHistory() {
    await dbConnect();
    data.forEach((e) => {
      historyUnsorted.push(e._id);
    });
    let sortedHistory = historyUnsorted.sort(function (a, b) {
      // Turn your strings into dates, and then subtract them
      // to get a value that is either negative, positive, or zero.
      return new Date(b.date) - new Date(a.date);
    });

    const key = "term";
    const arrayUniqueByKey = [
      ...new Map(sortedHistory.map((item) => [item[key], item])).values(),
    ];

    res.json(arrayUniqueByKey);
  }

  getHistory();
});

server.listen(port, () => console.log("Server running at port ", port));
