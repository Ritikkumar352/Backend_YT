import { Router } from "express";
import multer from "multer"; // add on 08/05/24
//import {upload} from "../middlewares/multer.midleware.js"
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

// import {upload} from "../middlewares/multer.midleware.js"
console.log("Ritik--import upload from multer in user.route");

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

router.route("/login").post(loginUser);

// secured routes --> LOGOT

//verifyJWT verifes that user is logged in or not.. perform action only if user is logged in

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);

router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateAccountDetails); // posst will update all details .. read about patch

router
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router
  .route("/cover-image")
  .patch(verifyJWT, upload.single("/coverImage"), updateUserCoverImage);

router.route("/C/:username").get(verifyJWT, getUserChannelProfile);

//not receiving anything fro user so we are using .get

router.route("/history").get(verifyJWT, getWatchHistory);

export default router;

// import {Router} from "express";
// import { registerUser } from "../controllers/user.controller.js";

// const router=Router()

// router.route("/register").post(registerUser)

// export default router
