import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" })); //for url encoding like -> ritik kumar --->ritik%20kumar or ritik+kumar
app.use(express.static("public"));
app.use(cookieParser()); //to store and read cookies from user's browser

//routes import

import userRouter from "./routes/user.routes.js";

//routes declaration

app.use("/api/v1/users", userRouter);

// https://localhost:8000/api/v1/users/register

export { app };
//not showing both
// app.get("/", (req, res) => {
//   res.send("host is ready");
// });
// app.get("/login", (req, res) => {
//     res.send("<h1>hellooooow</h1>");
//   });

// or export default app
