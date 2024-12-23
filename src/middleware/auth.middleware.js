import {asyncHandler} from "../utils/asyncHandler.js"
import  {ApiError} from "../utils/ApiError.js"
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"
//to verify if user is authenticated or not
// to verify the user is logged we  have to compare the refresh tokens
//if the user has right tokens then add a new object to req.user
export const verifyJWT =asyncHandler(async (req,_,next) => {
try {
        //we have token access since request has cookie access thnks to cookiw parser
        // if for some reason we dont have accesstoken we can get token from header, Authorization: Bearer <token>
        const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    
        if(!token){
            throw new ApiError(401,"Unauthorized request")
        }
    
        const decodedToken=jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401,"Invalid access token")
        }
    
        req.user=user;
        next()
    
} catch (error) {
    throw new ApiError(401,error?.message ||"Invalid access token")
    
}

})