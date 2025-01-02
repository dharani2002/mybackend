import { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js";
import { Subscription } from "../models/subscription.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleSubscription =asyncHandler(async (req,res) => {
    const {channelId}=req.params

    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"cannot fetch channel details")
    }

    //get channel, channel is also a user
    const channel=await User.findById(channelId)
    if(!channel){
        throw new ApiError(404,"channel does not exist")
    }

    const user=await User.findOne(
        {refreshToken: req.cookies.refreshToken}
    )
    if(!user){
        throw new ApiError(404,"invalid user")
    }

    const userSub=await Subscription.findOne({
        subscriber:user._id,
        channel:channelId
    })

    if(userSub){
        const unsubscribe=await Subscription.findOneAndDelete(
            {
                subscriber:user._id,
                channel:channel._id
            }
        )
        if(!unsubscribe){
            throw new ApiError(500,"Something went wrong while unsubscribing")
        }

        return res
        .status(200)
        .json(new ApiResponse(200,unsubscribe,"User unsubscribed"))
    }
    else if(!userSub){
        const subscribe=await Subscription.create(
            {
                subscription:user._id,
                channel:channel._id
            }
        )
        if(!subscribe){
            throw new ApiError(500,"Something went wrong while subscribing")
        }
        return res
        .status(200)
        .json(new ApiResponse(200,subscribe,"User Subscribed"))
    }

    
})

const getUserChannelSubscribers=asyncHandler(async (req,res) => {
    const {channelId}=req.params
    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"cannot fetch channel details")
    }
    
    const channel=await User.findById(channelId)
    if(!channel){
        throw new ApiError(400,"channel does not exist")
    }

    const subscribers=await Subscription.find(
        {
            channel:channel?._id
        }
    ).populate('subscriber')

    const subCount=await Subscription.countDocuments({
        channel:channelId
    })

    return res
    .status(200)
    .json(new ApiResponse(200,{subscribers,subCount},"subscribers retrieved successfully"))
})

const getSubscribedChannels= asyncHandler(async (req,res) => {
    const {subscriberId}=req.params

    const subscriptions= await Subscription.find({subscriber:subscriberId}).populate('channel');
    
    const subscriptionCount=await Subscription.countDocuments({
        subscriber:subscriberId
    })

    return res
    .status(200)
    .json(new ApiResponse(200,{subscriptionCount,subscriptions},"Subscribed channels fetched successfully"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}