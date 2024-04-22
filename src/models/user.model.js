import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


const userSchema = new Schema({
  user: {    // username: ?? check in hitesh's repo code ---> username
    type: String,
    required: true,
    uniquie: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    uniquie: true,
    lowercase: true,
    trim: true,
  },
  fullname: {    // fullName ??  --> if changed, do change in another files also
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  avatar: {
    type: String, //cloudinary url
    required: true,
  },
  coverImage: {
    type: String, //cloudinary url
  },
  watchHistory:{
    type:Schema.Types.ObjectId,
    ref:"Video"
  },
  password:{
    type:String,
    required:[true,'Password is required']
  },
  refreshToken:{
    type:String
  }

},{timestamps:true});

userSchema.pre("save",async function (next){
    if(!this.isModified("password")) return next();
    // if pass is not changed don't encrypt again --> exit
    this.password=bcrypt.hash(this.password,10)
    next()
})

 userSchema.methods.isPasswordCorrect=async function(password){
   return await bcrypt.compare(password,this.password)
 }


// both are jtw tokens one is stored in DB

userSchema.methods.generateAccessToken=function(){
   return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }

    )
}

userSchema.methods.generateRefreshToken=function(){
    return jwt.sign(
        {
            _id: this._id,
           
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }

    )
}


export const User = mongoose.model("User", userSchema);
