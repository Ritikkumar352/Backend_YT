// require ('dotenv').configDotenv({path: './env'})

import dotenv from "dotenv";
import connectDB from "./db/index.js";
import {app} from './app.js';
// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";

import express from "express";
// const app=express()
dotenv.config({
  path: "./.env",  //fixed /.env --- it was /env
});

// second approach (better)

connectDB()
.then(()=>{

    //add error before
    app.listen(process.env.PORT || 8000,()=>{
        console.log("server is running at ",process.env.PORT);
    })
})
.catch((err)=>{
    console.log("MONGO db connection failed !!!", err)
})

















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
