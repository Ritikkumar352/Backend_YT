import { asyncHandler } from "../utils/asyncHandler";   



export const verifyJWT=asyncHandler(async(req,res,next)=>{
    req.cookies?.accessToken || req.header("Authorization")
})