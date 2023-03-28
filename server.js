const express = require("express");
const cors = require("cors");
const http = require("http");
const options = require("./nhsKey");
const historySchema = require("./mongo-schema/historySchema");
const conn = require("./mongodbConnect");
const uri = require("./mongoUri");
const mongoose = require("mongoose");
const fetch = require("node-fetch");
const { link } = require("fs");

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
      terms.push({ name: element.name, desc: element.description });
    });
    res.send(terms);
  } catch (error) {
    let errorMsg = {
      error:
        "Sorry, we could not perform this operation because of a problem with your internet connection. Please check your internet connection and try again",
    };

    res.send(errorMsg);
  }
});
app.post("/meaning", async (req, res) => {
  let apiWord;
  const value = req.body.term;
  let searchedTerm;
  const dbConnect = async (value) => {
    const documentToFind = { term: value.toLowerCase() };
    try {
      await conn.connectToDatabse();

      let result = await conn.termsCollection.findOne(documentToFind);
      apiWord = result.apiLink;
      searchedTerm = result.realWord;
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
      // if (response.status >= 400 && response.status < 600) {
      //   throw new Error(
      //     "Sorry, we could not find the word you are looking for in our dictionary. Please check your spelling or try searching for a different word."
      //   );
      // }
      console.log(response.status);
      const data = await response.json();
      let initialUrl = `https://api.nhs.uk/conditions/${apiWord}/`;
      let name = data.name;

      const content = new historySchema({
        term: searchedTerm,
        url: data.url,
        description: data.description,
        date: new Date(),
      });

      const val = await content.save();
      let meaning = {};
      let details = [];
      let links = [];

      let info = data.mainEntityOfPage;
      // console.log(JSON.stringify(info));

      if (data.relatedLink) {
        let linkInfo = data.relatedLink;

        let count = 0;
        linkInfo.forEach((e) => {
          if (e.url != initialUrl) {
            links.push({
              id: count,
              name: e.name,
              url: e.url,
            });
            count++;
          }
        });
      }

      //Loops through the main entity of page array

      info.forEach((e) => {
        if (e.hasPart) {
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
        } else {
          // console.log(e.mainEntityOfPage);
          let linkInfo = e.mainEntityOfPage;
          console.log(linkInfo);
          let count = 0;
          linkInfo.forEach((element) => {
            links.push({
              id: count,
              name: element.headline,
              url: element.url,
            });
            count++;
          });
        }
      });
      // console.log(links[0].url);
      // console.log(initialUrl);

      meaning = { name, apiWord, links, details };
      res.json(meaning);
    } catch (err) {
      // console.log(
      //   "No results found, check spelling or try to another search term."
      // );
      console.log(err);
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
  try {
    const url = req.body.url;
    const response = await fetch(url, options);
    const data = await response.json();

    let meaning = {};
    let details = [];
    let links = [];
    let name = data.about.name;

    var link = url.substring("/", url.lastIndexOf("/"));
    var linkDelete = link.substring("/", link.lastIndexOf("/"));

    // console.log(`${linkDelete}/`);

    let initialUrl = `${linkDelete}/`;
    let info = data.mainEntityOfPage;
    let linkInfo = data.relatedLink;

    if (data.relatedLink) {
      let linkInfo = data.relatedLink;

      let count = 0;
      linkInfo.forEach((e) => {
        if (e.url != initialUrl) {
          links.push({
            id: count,
            name: e.name,
            url: e.url,
          });
          count++;
        }
      });
    }

    //Loops through the main entity of page array
    info.forEach((e) => {
      if (e.hasPart) {
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
      } else {
        // console.log(e.mainEntityOfPage);
        let linkInfo = e.mainEntityOfPage;

        let count = 0;
        linkInfo.forEach((element) => {
          links.push({
            id: count,
            name: element.headline,
            url: element.url,
          });
          count++;
        });
      }
    });

    meaning = { name, links, details };
    res.json(meaning);
  } catch (err) {
    let errorMsg = {
      error:
        "Oops, we are unable to perform this operation at this time. Kindly try again later",
    };

    res.send(errorMsg);
    console.log(err);
  }
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
app.get("", (req, res) => {
  res.send("Welcome to my first ever live API");
});

server.listen(port, () => console.log("Server running at port ", port));
