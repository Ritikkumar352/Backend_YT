import { Router } from "express";
import multer from "multer"; // add on 08/05/24
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// app is running after add this block of code

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original file name
  },
});

const upload = multer({ storage: storage });

// app is running after add this block of code above


router.route("/register").post(
  // code from here is crashing this app
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  // error to here--> upload is not defined in multer
  registerUser
);
// router.route("/login").post(login);

router.route("/login").post(loginUser)


// secured routes --> LOGOT

router.route("/logout").post(verifyJWT,logoutUser)



export default router;















// import {Router} from "express";
// import { registerUser } from "../controllers/user.controller.js";

// const router=Router()

// router.route("/register").post(registerUser)

// export default router
