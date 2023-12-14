

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
      conn.client.close((err) => {
        if (err) {
          console.error("Failed to close MongoDB client", err);
          return;
        }

        console.log("MongoDB client closed");
      });
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
app.post("/details", async (req, res) => {
  let apiWord = req.body.term;

  try {
    mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    getWordInfo();
  } catch (err) {
    res.send(err);
    error = {
      error:
        "Sorry, we could not perform this operation because of a problem with your internet connection. Please check your internet connection and try again.t",
    };
  }

  async function getWordInfo() {
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
      const data = await response.json();
      let initialUrl = `https://api.nhs.uk/conditions/${apiWord}/`;
      let name = data.name;

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
      meaning = { name, apiWord, links, details };
      res.json(meaning);
      // console.log("pop");
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
    }
  }
});
app.get("/history", async (req, res) => {
  var data = [];
  let historyUnsorted = [];

  const dbConnect = async () => {
    try {
      await conn.connectToDatabse();
      console.log("worked");
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

      console.log("conn to collection worked");
      data = result;
    } catch (err) {
      console.error(`error ${err}`);
      let errorMsg = {
        error:
          "Sorry, we could not perform this operation because of a problem with your internet connection. Please check your internet connection and try again",
      };

      res.json(errorMsg);
    } finally {
      conn.client.close((err) => {
        if (err) {
          console.error("Failed to close MongoDB client", err);
          return;
        }

        console.log("MongoDB client closed");
      });
    }
  };

  function sortByFrequency(arr) {
    const count = {};

    // Count the occurrence of each value in the array
    arr.forEach((val) => {
      count[val] = count[val] ? count[val] + 1 : 1;
    });
    // Convert the object to an array and sort it by count in descending order
    const sorted = Object.entries(count).sort((a, b) => b[1] - a[1]);

    let sortedArray = [];
    sorted.forEach((e) => {
      sortedArray.push(e[0]);
    });
    // Map the sorted array to extract only the values and return the result
    return sortedArray;
  }
  async function getHistory() {
    await dbConnect();
    data.forEach((e) => {
      historyUnsorted.push(e._id);
    });
    let newArray = [];

    historyUnsorted.forEach((e) => {
      newArray.push(e.term);
    });

    const sorted = sortByFrequency(newArray);

    let history = [];

    sorted.forEach((e) => {
      historyUnsorted.forEach((element) => {
        if (e == element.term) {
          history.push({ term: e, desc: element.desc });
        }
      });
    });

    const key = "term";
    const arrayUniqueByKey = [
      ...new Map(history.map((item) => [item[key], item])).values(),
    ];

    res.json(arrayUniqueByKey);
  }
  getHistory();
});
app.get("", (req, res) => {
  res.send("Welcome to my first ever live API");
});
app.post("/word-info", async (req, res) => {
  let apiWord;
  let data;
  let output;
  const value = req.body.term;
  const dbConnect = async (value) => {
    const documentToFind = { term: value.toLowerCase() };

    try {
      await conn.connectToDatabse();
      let result = await conn.termsCollection.findOne(documentToFind);
      if (!result) {
        output = {
          error:
            "We cannont find this term in our repository. Check the spelling and try again ",
        };
      }
      apiWord = result.apiLink;
      const detailToFind = { apiWord };
      console.log("found");
      data = await conn.detailsCollection.findOne(detailToFind);
      if (!data) {
        output = {
          error:
            "We  currently cannont find this term in our repository. Kindly try again later ",
        };
      }
    } catch (err) {
      console.error(`error ${err}`);
    } finally {
      conn.client.close((err) => {
        if (err) {
          console.error("Failed to close MongoDB client", err);
          return;
        }

        console.log("MongoDB client closed");
      });
    }
  };

  try {
    mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    getWordInfo();
  } catch (err) {
    let error = {
      error:
        "Sorry, we could not perform this operation because of a problem with your internet connection. Please check your internet connection and try again.t",
    };
    // res.send(err);
  }

  async function getWordInfo() {
    await dbConnect(value);
    try {
      let apiWord = data.apiWord;

      let info = data.details;

      let details = info.details;
      let links = info.links;
      let name = info.name;

      output = { name, apiWord, links, details };
    } catch (err) {
      if (!output) {
        output = {
          error:
            " Sorry, we could not perform this operation because of a problem with your internet connection. Please check your internet connection and try again",
        };
      }
    }

    res.json(output);
  }
});
app.post("/subsection", async (req, res) => {
  let data;
  const value = req.body.section.toLowerCase();

  const dbConnect = async (value) => {
    const documentToFind = { section: value };

    try {
      await conn.connectToDatabse();
      data = await conn.subsectionCollection.findOne(documentToFind);
      // data = result;
      // console.log(data);
    } catch (err) {
      console.error(`error ${err}`);
    } finally {
      conn.client.close((err) => {
        if (err) {
          console.error("Failed to close MongoDB client", err);
          return;
        }

        console.log("MongoDB client closed");
      });
    }
  };
  try {
    mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    getInfo();
  } catch (err) {
    // res.send(err);
    error = {
      error:
        "Sorry, we could not perform this operation because of a problem with your internet connection. Please check your internet connection and try again.t",
    };
    res.send(error);
  }

  async function getInfo() {
    await dbConnect(value);
    try {
      let info = data.details;
      let details = info.details;
      let links = info.links;
      let name = info.name;

      meaning = { name, links, details };
      res.json(meaning);
    } catch (err) {
      res.json({
        error:
          "Sorry we are unable to perform this operation at this time. Please try again later",
      });
    }
    // res.send(data)
  }
});
app.post("/conditions", async (req, res) => {
  let details = [];
  let output;

  const value = req.body.letter;
  const documentToFind = { tag: value };
  const options = {
    sort: { term: 1 },
  };
  try {
    await conn.connectToDatabse();
    data = conn.glossaryCollection.find(documentToFind, options);
    // await data.forEach(console.dir)
    await data.forEach((detail) =>
      details.push({ term: detail.term, tag: detail.tag, desc: detail.desc })
    );
    output = { details };
  } catch (err) {
    console.error(`error ${err}`);
    let error = {
      error:
        "Sorry, we could not perform this operation because of a problem with your internet connection. Please check your internet connection and try again.t",
    };
    output = error;
  } finally {
    // conn.client.close();
  }
  res.json(output);
});
app.get("/allConditions", async (req, res) => {
  let conditions = [];
  let data;
  // try {
  try {
    await conn.connectToDatabse();
    data = conn.glossaryCollection.find({}).toArray();
    let result = await data;
    result.forEach((e) => {
      conditions.push(e.term);
    });
    res.json(conditions);
  } catch (err) {
    console.error(`error ${err}`);
    let error = {
      error:
        "Sorry, we could not perform this operation because of a problem with your internet connection. Please check your internet connection and try again.t",
    };
    res.send(error);
  }
  // .toArray(function(err, result) {
  //   if (err) throw err;
  //   console.log(result);
  //   db.close();});
  // await data.forEach(console.dir)
  // await data.forEach((detail) =>
  //   details.push({ term: detail.term, tag: detail.tag, desc: detail.desc })
  // );
  // } catch (err) {
  //   console.error(`error ${err}`);
  // } finally {
  //   // conn.client.close();
  // }
});
app.post("/addToHistory", async (req, res) => {
  let term = req.body.term;
  const documentToFind = { term: term };

  try {
    await conn.connectToDatabse();
    let result = await conn.glossaryCollection.findOne(documentToFind);
    let data = result;
    let sendData;

    const content = new historySchema({
      term: data.term,
      description: data.desc,
      date: new Date(),
    });
    console.log(content);

    conn.historiesCollection.insertOne(content, (err, result) => {
      if (err) {
        console.error("Failed to insert document", err);
        return;
      }
    });

    // const val = await content.save();})

    console.log("sent!");
    sendData = "done";
    res.json("done");
  } catch (err) {
    // console.log(err);
    sendData = err;
    res.json(err);
  }
});

app.post("/admin-login", async (req, res) => {
  const { username, password } = req.body;

  let documentToFind = { username, password };
  let output;
  try {
    await conn.connectToDatabse();
    let result = await conn.adminCollection.findOne(documentToFind);
    if (result) {
      output = { sucess: "Logged in!", id: result._id.toString() };
    } else {
      output = { error: "Wrong username or passsword" };
    }
  } catch (err) {
    console.log(err);
    output = { error: "Someting went wrong" };
    // sendData = err;
    // res.json(err);
  }
  // res.status(200).send(password);
  res.json(output);
});
app.post("/create-admin", async (req, res) => {
  const { username } = req.body;
  let output;
  const password = "Admin!";
  let user = { username, password };
  let error;

  const content = new adminSchema({
    username,
    password,
    createdAt: Date(),
  });

  try {
    mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const val = await content.save();
    output = { sucess: "Admin sucessfully added" };
  } catch (err) {
    if (err.code === 11000) {
      error = {
        error: `${user.username} already exists. Kindly try another username`,
      };
      output = error;
    } else {
      console.error("errorrrr", err);
    }
    output = error;
  }

  res.json(output);

  // res.status(200).send(password);
});
app.post("/add-condition", async (req, res) => {
  const { term, details } = req.body;

  let documentToFind = { term: term.toLowerCase() };
  let output;
  let error;
  let detail = {
    name: term,
    apiWord: term.toLowerCase().replaceAll(" ", "-"),
    links: [],
    details: [{ text: details }],
  };

  const newTerm = new termSchema({
    term: term.toLowerCase(),
    apiLink: term.toLowerCase().replaceAll(" ", "-"),
    realWord: term,
    createdAt: Date(),
  });

  const newDetail = new detailsSchema({
    apiWord: term.toLowerCase().replaceAll(" ", "-"),
    details: detail,
    createdAt: Date(),
  });

  try {
    await conn.connectToDatabse();
    let result = await conn.termsCollection.findOne(documentToFind);
    // conn.client.close();
    mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    if (result) {
      output = { error: "This term already exists in the repository" };
    } else {
      let val = await newTerm.save();
      let pik = await newDetail.save();
      output = { sucess: "Condition sucessfully added" };
      console.log(val, pik);
    }
  } catch (err) {
    console.error("errorrrr", err);
    error = {
      error: "Something went wrong. Please try again later",
    };
    output = error;
  }

  res.json(output);
});
app.patch("/edit-condition/:id", async (req, res) => {
  const { term, details } = req.body;
  const id = req.params.id;
  let output;
  console.log(id);
  console.log(details);

  async function updateOneDocument(collection, documentId, updateData) {
    try {
      await conn.connectToDatabse();
      const filter = { _id: new ObjectId(documentId) };
      console.log(filter);
      const update = { $set: updateData };
      const result = await collection.updateOne(filter, update);
      console.log(`${result.modifiedCount} document(s) updated`);
      if (result.modifiedCount > 0) {
        output = {
          sucess: `Document has been updated`,
        };
      } else {
        console.log("pop");
        output = { error: "No edit made" };
      }
      console.log("pop");
    } catch (error) {
      console.error(error);
      output = { error: "Something went wrong. Please try again later" };
    } finally {
      await conn.client.close();
    }

    res.json(output);
  }
  updateOneDocument(conn.detailsCollection, id, {
    "details.details": details,
  });
  console.log(output);
  console.log("done");
});
app.post("/get-condition", async (req, res) => {
  const term = req.body.term;
  let documentToFind = { term: term.toLowerCase() };
  let output;
  let error;

  try {
    await conn.connectToDatabse();
    let result = await conn.termsCollection.findOne(documentToFind);

    if (!result) {
      output = { error: `${term} not found. Check the spelling and try again` };
    } else {
      const key = result.apiLink;
      const id = result._id.toString();

      let content = await conn.detailsCollection.findOne({ apiWord: key });

      let newDetails = content.details.details;
      output = {
        details: newDetails,
        termId: id,
        detailId: content._id.toString(),
      };
      console.log(newDetails);
    }
  } catch (err) {
    console.error("errorrrr", err);
    error = {
      error: "Something went wrong. Please try again later",
    };
    output = error;
  }
  res.json(output);
});
app.get("/documents-total", async (resq, res) => {
  await conn.connectToDatabse();

  let detailsResult;
  let historyResult;
  let output;
  let arrayUniqueByKey;

  detailsResult = await conn.detailsCollection.countDocuments();

  if (detailsResult) {
    var data = [];
    let historyUnsorted = [];
    let history = [];

    const dbConnect = async () => {
      try {
        await conn.connectToDatabse();
        console.log("worked");
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

        console.log("conn to collection worked");
        data = result;
      } catch (err) {
        console.error(`error ${err}`);
        output = {
          error:
            "Sorry, we could not perform this operation because of a problem with your internet connection. Please check your internet connection and try again",
        };
      } finally {
        conn.client.close((err) => {
          if (err) {
            console.error("Failed to close MongoDB client", err);
            return;
          }
          console.log("MongoDB client closed");
        });
      }
    };

    function sortByFrequency(arr) {
      const count = {};

      // Count the occurrence of each value in the array
      arr.forEach((val) => {
        count[val] = count[val] ? count[val] + 1 : 1;
      });
      // Convert the object to an array and sort it by count in descending order
      const sorted = Object.entries(count).sort((a, b) => b[1] - a[1]);

      let sortedArray = [];
      sorted.forEach((e) => {
        sortedArray.push(e[0]);
      });
      // Map the sorted array to extract only the values and return the result
      return sortedArray;
    }
    async function getHistory() {
      await dbConnect();
      data.forEach((e) => {
        historyUnsorted.push(e._id);
      });
      let newArray = [];

      historyUnsorted.forEach((e) => {
        newArray.push(e.term);
      });

      const sorted = sortByFrequency(newArray);

      sorted.forEach((e) => {
        historyUnsorted.forEach((element) => {
          if (e == element.term) {
            history.push({ term: e, desc: element.desc });
          }
        });
      });

      const key = "term";
      arrayUniqueByKey = [
        ...new Map(history.map((item) => [item[key], item])).values(),
      ];
      // console.log(history);
    }
    await getHistory();

    let historyList = [];
    let fullHistory = [];

    history.forEach((e) => {
      fullHistory.push(e.term);
    });

    const arr = fullHistory;

    const result = arr.reduce((acc, curr, index) => {
      const existing = acc.find((item) => item.value === curr);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ value: curr, count: 1 });
      }
      return acc;
    }, []);

    console.log(result); // Output: [{ index: 0, value: 1, count: 3 }, { index: 1, value: 2, count: 2 }, { index: 2, value: 3, count: 1 }, { index: 3, value: 4, count: 1 }]
    // Output: [{value: 1, count: 3}, {value: 2, count: 2}, {value: 3, count: 1}, {value: 4, count: 1}]
    // Output: [{index: 0, value: 1, count: 3}, {index: 1, value: 2, count: 2}, {index: 2, value: 3, count: 1}, {index: 3, value: 4, count: 1}]

    arrayUniqueByKey.forEach((e) => {
      historyList.push(e.term);
    });
    historyResult = historyList.length;

    output = {
      totalTerms: detailsResult,
      totalHistory: historyResult,
      historyList,
      fullHistory: result,
    };
  } else {
    output = {
      error: "Something went wrong. Please try again later",
    };
  }
  // console.log(await pop);
  res.json(output);
});
app.delete("/delete-condition/:termId/:detailId", async (req, res) => {
  let detId = req.params.detailId;
  let termId = req.params.termId;
  let output;
  // const MyModel = require('./my-model');

  // Define a function to delete a document by ID
  async function deleteDocumentById(id1, id2) {
    try {
      // Delete the document
      const { deletedCount } = await conn.termsCollection.deleteOne({
        _id: new ObjectId(id1),
      });
      const { delCount } = await conn.detailsCollection.deleteOne({
        _id: new ObjectId(id2),
      });

      // Check if the document was deleted
      if (deletedCount === 0 || delCount === 0) {
        // Return an error if the document was not found
        output = {
          error: "Condition not found",
        };
        // console.log("notfound");
        throw new Error(`Document with ID ${id1} not found`);
      }

      // Return the deleted document
      return { id1, id2 };
    } catch (error) {
      // Handle errors
      console.error(`Error deleting document with ID ${id1}: ${error.message}`);
      output = {
        error: "Condition not found",
      };
      throw error;
    }
  }

  // Call the function to delete a document
  deleteDocumentById(termId, detId)
    .then((deletedDocument) => {
      res.json({ sucess: "Document  deleted successfully" });
      output = { sucess: "Document  deleted successfully" };
      console.log(`Document  deleted successfully`, output);
    })
    .catch((error) => {
      console.error(`Error deleting document: ${error.message}`);
      res.json({
        error: "Condition not found",
      });
    });
  // res.json(output);
});
