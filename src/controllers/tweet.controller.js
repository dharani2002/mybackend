import { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const createTweet=asyncHandler(async (req,res) => {
   const {content}=req.body
   if(!content){
    throw new ApiError("content is required")
   } 

   const tweet=await Tweet.create(
    {
        content,
        owner:req.user._id
    }
   )

   if(!tweet){
    throw new ApiError("error while tweeting")
   }

   return res
   .status(200)
   .json(
    new ApiResponse(200,tweet,"tweeted successfully")
   )
})

const getUserTweets=asyncHandler(async (req,res) => {
    const tweet=await Tweet.find({
        owner:req.user._id
    })

    if(!tweet){
        throw new ApiError("no tweets found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,tweet,"tweets fetched successfully")
    )
    
})

const deleteTweet=asyncHandler(async (req,res) => {
    const {tweetId}=req.params
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"invalid tweet id")
    }

    const tweet=await Tweet.findByIdAndDelete(tweetId)
    if(!tweet){
        throw new ApiError("tweet not found")
    }

    return res
    .status(200)
    .json(200,{},"tweet deletd successfully")
})

export {
    createTweet,
    getUserTweets,
    deleteTweet
}