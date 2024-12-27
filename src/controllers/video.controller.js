import mongoose from "mongoose";
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCoudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const publishVideo=asyncHandler(async (req,res) => {
    //get title and descripton
    //get video and thumbnail
    //upload on cloudinary
    //add url to mongo
    //return response
    const {title,description}=req.body
    //console.log(title)
    //console.log(description)
    if(!title || !description){
        throw new ApiError(400,"all fields are required")
    }

    const videoLocalPath=req.files?.videoFile[0].path
    if(!videoLocalPath){
        throw new ApiError(400,"video path doesnt exists")
    }

    const thumbnailLocalPath = req.files?.thumbnail[0].path
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "thumbnail path doesnt exists")
    }

    const videoFile=await uploadOnCoudinary(videoLocalPath)
    const thumbnail=await uploadOnCoudinary(thumbnailLocalPath)
    if(!videoFile || !thumbnail){
        throw new ApiError(400,"required video/ thumbnail is not found")
    }
    

    const video=await Video.create({
        title,
        description,
        videoFile:videoFile.url,
        thumbnail:thumbnail.url,
        duration:videoFile.duration,
        owner:req.user._id

    })

    if(!video){
        throw new ApiError(500,"Something went wrong while publishing the video")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,video,"video published successfully")
    )

    
})

export {
    publishVideo,
}