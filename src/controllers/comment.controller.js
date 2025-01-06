import { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const addComment=asyncHandler(async (req,res) => {
    const {videoId}=req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"video does not exist")
    }
    const {content}=req.body
    if(!content){
        throw new ApiError(400,"content field is required")
    }
    const video=await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"video not found")
    }
    const comment=await Comment.create({
        content,
        video:videoId,
        owner:req.user._id
    })
    if(!comment){
        throw new ApiError(400,"error while commenting")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,comment,"comment added successfully")
    )

})

const deleteComment=asyncHandler(async (req,res) => {
    const {commentId}=req.params
    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"invalid comment id")
    }
    await Comment.findByIdAndDelete(commentId)

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"comment deleted successfully")
    )
})

const getVideoComments=asyncHandler(async (req,res) => {
    const {videoId}=req.params
    const {page=1,limit=10}=req.query
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"invalid video ID")
    }

    const pageNumber = parseInt(page);
    const limitOfComments = parseInt(limit);

    const video=await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"video not found")
    }

    const comment=await Comment.aggregatePaginate(
        Comment.aggregate([
            {
                $match:{
                    video:video._id
                }
            },
            {
                $lookup:{
                    from:"users",
                    localField:"owner",
                    foreignField:"_id",
                    as:"user"
                }
            },
            {
                $addFields:{
                    username:{
                        $arrayElemAt:["$user.username",0]
                    }
                }
            },
            {
                $project:{
                    username:1,
                    content:1,
                    createdAt:1,
                }
            },
            {
                $sort:{createdAt:-1}
            }
        ]),
        {page:pageNumber,limit:limitOfComments}
    )

    if(comment.length===0){
        throw new ApiError(400,"No comments on the video")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,comment,"comments fetched successfully")
    )
    
})

export {
    addComment,
    deleteComment,
    getVideoComments

}