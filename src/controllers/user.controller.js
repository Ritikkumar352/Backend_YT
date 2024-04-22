import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models//user.model.js"; // is this import correct ??--> correct done
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

  const { fullname, email, username, password } = req.body;
  console.log(email);
  console.log(username);
  console.log(fullname);

  // if(fullname===""){
  //   throw new ApiError(400,"fullname is required");
  // }

  // use this insted of multiple if checking

  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }
  // or use normal if for each -- [email,fullname,pass..]
  const existedUser = User.findOne({
    $or: [{ username }, { username }], // if found --> exixted user
  });
  if (existedUser) {
    throw new ApiError(409, "User with same email or username already exist");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError("400", "Avatar file is required");
  }

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "", // leave empty if path is not available
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken" // uselect password and refreshtoken
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while user register :-(");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        createdUser,
        "User register successfully !! ritikkkkkk"
      )
    );
});

export { registerUser };

// const registerUser = asyncHandler(async (req, res) => {
// res.status(200).json({
// message: "hello ritikkkkkk",
// });
// });
