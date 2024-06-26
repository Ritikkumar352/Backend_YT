import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async (userId) => {
  let user;
  try {
    user = await User.findById(userId);
    if (!user) {
      console.log("line number 12"); // console line for debugging
      throw new ApiError(404, "user not found");
    }
  } catch (error) {
    console.log("line number 15");
    throw new ApiError(500, "Error finding user", [], error.stack);
  }

  let accessToken;
  try {
    accessToken = user.generateAccessToken();
  } catch (error) {
    console.log("line number 23");
    throw new ApiError(500, "Error generating access token", [], error.stack);
  }

  let refreshToken;
  try {
    refreshToken = user.generateRefreshToken();
  } catch (error) {
    console.log("line number 32");
    throw new ApiError(500, "Error generating refresh token", [], error.stack);
  }

  try {
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
  } catch (error) {
    console.log("line number 40");
    throw new ApiError(
      500,
      "Error saving user with refresh token",
      [],
      error.stack
    );
  }

  return { accessToken, refreshToken };
};

// now this below and above both code is working -->  :-)

// const generateAccessAndRefreshTokens = async (userId) => {
//   try {
//     const user = await User.findById(userId);
//     const accessToken = user.generateAccessToken();
//     const refreshToken = user.generateRefreshToken();

//     user.refreshToken = refreshToken;
//     await user.save({ validateBeforeSave: false });

//     return { accessToken, refreshToken };
//   } catch (error) {
//     throw new ApiError(
//       500,
//       "something went wrong while generating refresh and access token "
//     );

//   }
// };

const registerUser = asyncHandler(async (req, res) => {
  // flow of regestration
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
  console.log(existedUser + " is this showing null??"); // test could remove

  if (existedUser) {
    throw new ApiError(409, "User with same email or username already exist");
  }

  // chcek this line 43 and 44
  const avatarLocalPath = req.files?.avatar[0]?.path; // optional check

  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  //new lines below --> these lines below are not uploading cover image , but running coze it's optional
  // let coverImageLocalPath;
  // if (
  //   registerUser.files &&
  //   Array.isArray(req.files.coverImage) &&
  //   req.files.coverImage.length > 0
  // ) {
  //   coverImageLocalPath = req.files.coverImage[0].path;
  // }
  // new lines above

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError("400", "Avatar upload failed");
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
    throw new ApiError(
      500,
      "Something went wrong while user register :-( ritik!"
    );
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
//login user code below

// ***LOGIN****

const loginUser = asyncHandler(async (req, res) => {
  // ToDo:-
  // req body se data lana h
  // find the user
  // password check
  // access and refresh token generation
  // send cookie

  const { email, username, password } = req.body;

  if (!username && !email) {
    // or use (!(username || email))
    throw new ApiError(400, "username or email is required");
  }

  // find user from "User" -> user.model.js

  // finding using email or username
  //  User.findOne({email}) will find using email only
  const user = await User.findOne({
    $or: [{ username }, { email }], // mongodb operator $ ..array
  });

  // for testing console statements..
  if (user) {
    console.log(
      "user to mil gaya hai it's " +
        user.username +
        " and it's email is " +
        user.email
    );
  }

  if (!user) {
    throw new ApiError(404, "User does not exist ");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(404, "Invalid user credentials ");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  //cookies

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true, // disables modifying cookies from frontend , only from server
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse( // this format in Api.response file
        200, //statusCode
        {
          user: loggedInUser,
          accessToken,
          refreshToken, //data
        },
        "User loggedIn successfully" //message
      )
    );
});

// ***LOG OUT***

const logoutUser = asyncHandler(async (req, res) => {
  // if res is unused we can write '_' --->  c(req,_)

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // remove field form document
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true, // disables modifying cookies from frontend , only from server
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

// to refrest access tok

// UPDATE

const refreshAccessToken = asyncHandler(async (req, res) => {
  // get refresh token from cookies
  // send it to server and renew acces token after refresh token of suer matches with the refresh token on server

  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request -> user.con");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.ACCESS_TOKEN_SECRET,
      REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token -> user.con");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, " refresh token is expired -> user.con");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      401,
      error?.message || "Invalid refresh token -- try catch-- 326"
    );
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body; //  confirm passwowd if(!(new=confpass-->error))
  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password chnaged successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(200, req.user, "current user fetched successfully");
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;
  if (!fullname || !email) {
    // && -- if both required
    throw new ApiError(400, "All fields are required");
  }

  const user = User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname,
        email: email, // we can use in both ways
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is mssing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar.url) {
    throw new ApiError(400, "Error while updating avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "cover image updated successfully"));
});

// check this block

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(400, "coverImage file is missing");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading coverImage");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "cover image updated successfully"));
});

// TODO-
// Make a utility to delete uplaoed images -- udateavatar and cover image

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim) {
    throw new ApiError(400, "username not found");
  }

  //2:50:00 re watch

  //aggregation pipeline --> learn from MongoDB

  const channel = await User.aggregate([
    {
      $match: {
        username: username.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "subscribers",
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
        $project: {
          fullname: 1,
          username: 1,
          subscriberCount: 1,
          channelsSubscribedToCount: 1,
          avatar: 1,
          coverImage: 1,
          email: 1,
          createdAt: 1,
        },
      },
    },
  ]);

  console.log("channel console" + channel);
  if (!channel?.length) {
    throw new ApiError(404, "channel does not exist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "user channel fetched successfully")
    );
});

// watch history

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline:[
                {
                  $project:{
                    fullname:1,
                    username:1,
                    avatar:1
                  }
                }, //3:27:00
                {
                  $addFields:{
                    owner:{
                      $first:"$owner"
                    }
                  }
                }
              ]
            },
          },
        ],
      },   
    },
  ]);
  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      user[0].watchHistory,
      "watch history fetched successfully"
    )
  )
});

//model for like, playlist 
// Write Video upload controller
// video model...
// tweet model... 


export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  changeCurrentPassword,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory
};

// const registerUser = asyncHandler(async (req, res) => {
//   res.status(200).json({
//     message: "hello ritikkkkkk express js",
//   });
// });
