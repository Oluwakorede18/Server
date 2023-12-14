const mongoose = require("mongoose");

mongoose.set("strictQuery", true);

const connectionString = process.env.MONGODB_CLOUD_URI;
console.log(connectionString);

const connectDb = async () => {
  if (connectionString == undefined) {
    throw new Error(
      "Create an .env file and transfer the variables from the .env.dev file into it, in order to start the server"
    );
  } else {
    await mongoose
      .connect(connectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.log("DB Connected");
      })
      .catch((error) => {
        throw new Error(`Error connecting to database \n ${error}`);
      });
  }
};

module.exports = connectDb;
