import { Schema } from "mongoose";


const tweetSchema=new Schema(
    {
        owner:{
            type:Schema.Types.ObjectId,
            ref:"user"
        },
        content:{
            type:String,
            require:true
        }
    },
    {
        timestamps:true
    }
)