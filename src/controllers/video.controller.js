import mongoose from "mongoose";
import {Video} from "../models/video.model.js"
//import {User} from "../models/user.model.js"
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

    console.log("req.files:", req.files);

    const videoLocalPath=req.files?.videoFile[0]?.path
    if(!videoLocalPath){
        throw new ApiError(400,"video path doesnt exists")
    }

    const thumbnailLocalPath = req.files?.thumbnail[0]?.path
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



const getVideoById=asyncHandler(async (req,res) => {
    const {videoId} =req.params
    if(!videoId){
        throw new ApiError(400,"video id is missing")
    }
    
    const video=await Video.findById(videoId)
    if(!video){
        throw new ApiError(400,"video not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,video,"video fetched successfully"))
})

// const getAllVideos=asyncHandler(async (req,res) => {
//     const {page=1,limit=10,query,sortBy, sortType}=req.query
    
//     const user=await User.find({
//         refreshToken:req.cookies.refreshToken,
//     })

//     if (!user) {
//         throw new ApiError(400, "user is required")
//     }

//     const pageNumber=parseInt(page)
//     const limitOfComments=parseInt(limit)

//     const skip=(pageNumber-1)*limitOfComments;
//     const pageSize=limitOfComments;

//     const videos=await Video.aggregatePaginate(
//         Video.aggregate([
//             {
//                 $match:{
//                     $or:[
//                         {title:{$regex:query,$options:"i"}},
//                         {description:{$regex:query,$options:"i"}}
//                     ],
//                     isPublished:true,
//                     owner:user._id
//                 }
//             },
//             {
//                 $lookup:{
//                     from:"likes",
//                     localField:""
//                 }
//             }
//         ])
//     )

    
// })


const updateVideoDetails=asyncHandler(async (req,res) => {
    const {videoId}=req.params
    if(!videoId){
        throw new ApiError(400,"video ID doesnot exist")
    }

    const {title,description}=req.body
    const thumbnailLocalPath=req.file?.path

    if(!title || !description){
        throw new ApiError(400,"all fields are required")
    }
    if(!thumbnailLocalPath){
        throw new ApiError(400,"thumbnail path is missing")
    }
    const thumbnail= await uploadOnCoudinary(thumbnailLocalPath)

    if(!thumbnail){
        throw new ApiError(400,"error while uploading file")
    }

    const video = await Video.findByIdAndUpdate(videoId,{
        $set:{
            title,
            description,
            thumbnail:thumbnail.url
        }
    },
    {
        new:true
    }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200,video,"video details updated successfully")
    )
    
})

const deleteVideo =asyncHandler(async (req,res) => {
    const {videoId}=req.params

    if(!videoId){
        throw new ApiError(400,"video id doesnt exist")
    }

    await Video.findByIdAndDelete(videoId)

    return res
    .status(200)
    .json(200,{},"Video deleted successfully")
    
})

const togglePublishStatus=asyncHandler(async (req,res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400, "video id doesnt exist")
    }

    const video =await Video.findById(videoId)

    if(!video){
        throw new ApiError(400,"video doesnt exist")
    }

    video.isPublished=!video.isPublished
    await video.save({ validateBeforeSave: false })

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"publish details updated successfully")
    )
})

export {
    publishVideo, 
    getVideoById,
    updateVideoDetails,
    deleteVideo,
    togglePublishStatus,
}