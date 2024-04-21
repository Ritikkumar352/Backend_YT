import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {
  // get user detalis from user-- required in user model
  // validation
  // check if already registered or not
  // check for images , check for avtar
  // upload them to cloudinary, avatar 
  // create user object -- create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return result

  const {fullname,email,username,password}=req.body
  console.log(email);
  console.log(username);
  console.log(fullname);


});

export { registerUser, };













// const registerUser = asyncHandler(async (req, res) => {
  // res.status(200).json({
    // message: "hello ritikkkkkk",
  // });
// });