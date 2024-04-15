// require ('dotenv').configDotenv({path: './env'})

import dotenv from "dotenv";
import connectDB from "./db/index.js";
// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";

dotenv.config({
  path: "./env",
});

// second approach (better)

connectDB();
















/* other approach (first)

import express from "express";
const app = express();

(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    app.on("error", (error) => {
      console.log("app not able to communicate");
      console.log("ERROR: ", error);
      throw error;
    }); //listeners

    app.listen(process.env.PORT, () => {
      console.log("app is listening on " + process.env.PORT);
    });

    app.get("/", (req, res) => {
      res.send("hellowwww done ");
    });
  } catch (error) {
    console.log("ERROR:", error);
    throw err;
  }
})(); //IFFe (iffy function)


*/
