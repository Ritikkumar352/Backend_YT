import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils//ApiResponse.js";

const generateAccessAndRefereshTokens = async(userId)=>{
  try{
    const user=await User.findById(userId)
    const accessToken=user.generateAccessToken()
    const refreshToken= user.generateRefreshToken()

    user.refreshToken=refreshToken
    await user.save({validateBeforeSave:false})

    return {accessToken, refreshToken}

  }catch(error){
    throw new ApiError(500,"something went wrong while generating referesh and access token ")
  }
}


const registerUser = asyncHandler(async (req, res) => {
  // get user detalis from user-- required in user model
  // validation
  // check if already registered or not
  // check for images , check for avtar
  // upload them to cloudinary, avatar
  // create user object -- create entry in db (object upload in db)
  // remove password and refresh token field from response(we get everything in responsejjjjj)
  // check for user creation
  // return result

  const { fullname, email, username, password } = req.body;
  console.log(email);
  console.log(username);
  console.log(fullname);
  console.log(password);
  console.log(req.files);
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
  const existedUser = await User.findOne({
    $or: [{ username }, { email }], // if found --> exixted user
  });
  console.log(existedUser+" is this showing null??"); // test could remove

  if (existedUser) {
    throw new ApiError(409, "User with same email or username already exist");
  }

// chcek this line 43 and 44
  const avatarLocalPath = req.files?.avatar[0]?.path; // optional check

//  const coverImageLocalPath = req.files?.coverImage[0]?.path;

//new lines below
let coverImageLocalPath;
if(registerUser.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
  coverImageLocalPath=req.files.coverImage[0].path
}
// new lines above 

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
    "-password -refreshToken" // unselect password and refreshtoken
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

//register user above
//login user code below   ***LOGIN****

const loginUser=asyncHandler(async(req,res)=>{
    // to-do
    // req body se data lana h
    // find the user
    // password check
    // access and refresh token generation
    // send cookie

    const{email,username,password}=req.body

    if(!username || !email){
      throw new ApiError(400,"username or email is required");
    }

    // find user from "User" -> user.model.js

    // finding using email or username
    //  User.findOne({email}) will find using email only
    const user=await User.findOne({
      $or:[{username},{email}] // mongodb operator $ ..array
    })

    if(!user){
      throw new ApiError(404,"User does not exist ")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
      throw new ApiError(404,"Invalid user credentials ")

    }

    const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

    //cookies

    const loggedInUser=await User.findById(user._id).select("-password -refreshToken")

    const options={
      httpOnly:true,
      secure:true  // disables modifying cookies from frontend , only from server

    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
      new ApiResponse(   // this format in Api.response file
        200,  //statusCode
        {
          user:loggedInUser,accessToken,refreshToken  //data
        },
        "User loggedIn successfully" //message
      )
    )

})


// ***LOG OUT***

const logoutUser=asyncHandler(async(req,res)=>{
  User.findById
})






export { 
  registerUser,
  loginUser
};

// const registerUser = asyncHandler(async (req, res) => {
//   res.status(200).json({
//     message: "hello ritikkkkkk express js",
//   });
// });
