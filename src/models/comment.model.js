import mongoose,{Schema} from "mongoose";

const commentSchema=new Schema(
    {
        content:{
            type:String,
            required:true,
            
        },
        video:{

        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
        }

    },
    {
        timestamps:true
    }




)