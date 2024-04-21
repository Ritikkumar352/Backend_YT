import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.midleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([  // middleware
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1 
        }

    ]),
    registerUser);
// router.route("/login").post(login);
export default router;

// import {Router} from "express";
// import { registerUser } from "../controllers/user.controller.js";

// const router=Router()

// router.route("/register").post(registerUser)

// export default router
