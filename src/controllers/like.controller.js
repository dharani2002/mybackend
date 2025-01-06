import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import { Comment } from "../models/comment.model.js"
import { Tweet } from "../models/tweet.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"invalid video ID")
    }

    const video=await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"video not found")
    }

    const existinglike=await Like.findOne({
       video:video._id,
       likedBy:req.user._id
    })

    if(existinglike){
        await Like.findByIdAndDelete(existinglike._id)
        return res
        .status(200)
        .json(
            new ApiResponse(200,{},"like removed successfuuly")
        )
    }

    else {
        const like=await Like.create({
            video:video._id,
            likedBy:req.user._id
        })

        if(!like){
            throw new ApiError(400,"unable to like the video")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200,like,"liked successfully")
        )
    }


})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "invalid comment ID")
    }

    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(404, "comment not found")
    }

    const existinglike = await Like.findOne({
        comment: comment._id,
        likedBy: req.user._id
    })

    if (existinglike) {
        await Like.findByIdAndDelete(existinglike._id)
        return res
            .status(200)
            .json(
                new ApiResponse(200, {}, "like removed successfuuly")
            )
    }

    else {
        const like = await Like.create({
            comment: comment._id,
            likedBy: req.user._id
        })

        if (!like) {
            throw new ApiError(400, "unable to like the comment")
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, like, "liked successfully")
            )
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "invalid video ID")
    }

    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(404, "tweet not found")
    }

    const existinglike = await Like.findOne({
        tweet: tweet._id,
        likedBy: req.user._id
    })

    if (existinglike) {
        await Like.findByIdAndDelete(existinglike._id)
        return res
            .status(200)
            .json(
                new ApiResponse(200, {}, "like removed successfuuly")
            )
    }

    else {
        const like = await Like.create({
            tweet: tweet._id,
            likedBy: req.user._id
        })

        if (!like) {
            throw new ApiError(400, "unable to like the tweet")
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, like, "liked successfully")
            )
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const likes = await Like.find({ likedBy: req.user._id, video: { $exists: true } }).populate('video');

    if (!likes) {
        return res.status(200).json(new ApiResponse(200, [], "No liked videos found"));
    }

    // Extract video details from the likes
    const likedVideos = likes.map(like => like.video);

    return (
        res
            .status(200)
            .json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"))
    );
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}