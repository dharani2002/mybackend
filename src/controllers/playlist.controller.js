import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
//import { User } from "../models/user.model.js";
import {Playlist} from "../models/playlist.model.js"
import { Video } from "../models/video.model.js";
import { isValidObjectId } from "mongoose";

const createPlaylist=asyncHandler(async (req,res) => {
    const {name,description}=req.body

    if(!name){
        throw new ApiError(400,"Name is required")
    }

    
    
    const playlist=await Playlist.create(
        {
            name,
            description:description||"",
            owner:req.user._id
        }
    )
    if(!playlist){
        throw new ApiError(400,"error while cretaing playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,playlist,"playlist created successfully")
    )
})

const getUserPlaylists=asyncHandler(async (req,res) => {
    const playlist=await Playlist.find({
        owner:req.user._id
    })
    if(!playlist || playlist.length===0){
        throw new ApiError(400,"user has no created playlists")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, playlist, "playlist created successfully")
        )
    
})

const getPlaylistById=asyncHandler(async (req,res) => {
    const {playlistId}= req.params

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"invalid playlist id")
    }

    const playlist=await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404,"playlist not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,playlist,"playlist fetched successfully")
    )
    
})

const addVideoToPlaylist=asyncHandler(async (req,res) => {
    const {videoId,playlistId}=req.params

    if(!isValidObjectId(videoId)|| !isValidObjectId(playlistId)){
        throw new ApiError(400,"error fetching url")
    }

    const video =await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"video not found")
    }

    // Check if video is already in the playlist
    const checkplaylist = await Playlist.findById(playlistId);
    if (checkplaylist.videos.includes(videoId)) {
        throw new ApiError(400, "Video already exists in the playlist");
    }

    const playlist=await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push:{
                videos:videoId
            }
        },
        {
            new: true
        }
    )
    if(!playlist){
        throw new ApiError("error adding video to playlist")
    }
    
    return res
    .status(200)
    .json(
        new ApiResponse(200,playlist,"video added to playlist successfully")
    )
    
})

const removeVideoFromPlaylist=asyncHandler(async (req,res) => {
    const { videoId, playlistId}=req.params
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"invalid playlist id")
    }
    
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"invalid video id")
    }

    const video=await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"video not found")
    }

    const checkplaylist = await Playlist.findById(playlistId);
    if (!checkplaylist.videos.includes(videoId)) {
        throw new ApiError(400, "Video is not in the playlist");
    }

    const playlist=await Playlist.findByIdAndUpdate(playlistId,
        {
        $pull:{
            videos:videoId
        }
        },
        {
            new:true
        }
    )

    if(!playlist){
        throw new ApiError(400,"error removing the video")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,playlist,"video removed successfully")
    )
})

const deletePlaylist =asyncHandler(async (req,res) => {
    const {playlistId}=req.params
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"playlist id invalid")
    }

    const playlist=await Playlist.findByIdAndDelete(playlistId)

    return res
    .status(200)
    .json(new ApiResponse(200,{},"playlist deleted successfully"))

    
})

const updatePlaylist=asyncHandler(async (req,res) => {
    const { playlistId } = req.params
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"invalid playlist id")
    }
    const { name, description } = req.body

    if(!name){
        throw new ApiError(400,"name field is required")
    }

    const playlist=await Playlist.findByIdAndUpdate(playlistId,
        {
            $set:{
                name,
                description:description||""
            }
        },
        {
            new:true
        }
    )

    if(!playlist){
        throw new ApiError("error while updatinf playlist details")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,playlist,"playlist updated successfully")
    )
    
})

export{
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}