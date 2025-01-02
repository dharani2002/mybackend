import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCoudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        //console.log(accessToken)

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }
}

const registerUser=asyncHandler(async (req,res) => {
    //get user details from frontend
    //validation -not empty
    //check if user laready exists: username, email
    //check for images, check for avatar
    //upload them to cloudinary, avatar
    //create user object- create entry in db
    //remove passowrd and refresh token from response
    //check for user creation  
    //remove password and refresh token field from response
    //check for user creation
    //return response 

    const {fullName, email, username, password } = req.body
    //console.log(req.body);
/*
    if(fullname === ""){
        throw new Error Apierror(400,fullname is required")
    } we can do this for each field
*/
    if(
        [fullName,email,username,password].some((field)=>field?.trim()==="")
    ){
        throw new ApiError(400,"all fields are required")
    }

    const existedUser=await User.findOne({
        $or : [{username},{email}]
    })
    // finds the first doc with same username and email
    if(existedUser){
        throw new ApiError(409,"user or email already existes")
    }

    const avatarLocalPath=req.files?.avatar[0]?.path;
    //const coverImageLocalPath= req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }

    const avatar=await uploadOnCoudinary(avatarLocalPath)
    const coverImage= await uploadOnCoudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"avatar not found")
    }

    const user= await User.create({
        fullName,
        avatar:avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })

    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")

    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"user registered successfully")
    )




})

const loginUser=asyncHandler(async (req,res) => {
    //get inputs from user
    //check for username or email
    //find user
    //password check
    //access and refresh token generate
    //send cookie
    
    const {email,username,password} =req.body
    if(!(username || email)){
        throw new ApiError(400,"username or email is required")

    }

    const user= await User.findOne({
        $or: [{username},{email}]
    })

    if(!user){
        throw new ApiError(404,"User does not exist")
    }

    //isPasswordCorrect is a method of the user made from userSchema using mongoose not the User in Monogdb

    const isPasswordValid=await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "invalid user credentials")
    }
    //console.log(user._id)
    const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)
    //console.log(accessToken)
    //update or query whichever is cost effective

    const loggedInUser=await User.findById(user._id).select("-password -refreshToken")

    const options={
        httpOnly:true,
        secure:true
    }
     return res
     .status(200)
     .cookie("accessToken",accessToken,options)
     .cookie("refreshToken",refreshToken,options)
     .json(
        new ApiResponse(200,{
            user:loggedInUser,accessToken,refreshToken
        },
        "User logged in successfully"
        )
     )

})

const logoutUser =asyncHandler(async (req,res) => {
    // earlier we were getting inputs from user which we were getting through req.body and then we were able to find
    //the object using User.findById
    //but for logout we cant take input from user for this we need a middleware
    //now we have access to user req.user thnks to auth middleware
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshToken: 1
            }
        },
        {
            new:true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged out"))
    
})

//why we need to refresh the accesstoken again?
//once the access token expires the user has to logi  again to make rerquests
//to avoid logging in the middle of session again n again we write a code in front end to make a request
//that will refresh, we will now write the endpoint of that request
const refreshAccessToken=asyncHandler(async (req,res) => {
        const incomingRefreshToken=req.cookies.refreshToken|| req.body.refreshToken
        //console.log(incomingRefreshToken)
        if(!incomingRefreshToken){
            throw new ApiError(401, "Unauthorized Request")
        }
    
        try {
            const decodedToken=jwt.verify(
                incomingRefreshToken,
                process.env.REFRESH_TOKEN_SECRET
            )
            const user=await User.findById(decodedToken?._id)
            if(!user){
                throw new ApiError(401,"invalid refresh token")
            }
            //console.log(user.refreshToken)
            if(incomingRefreshToken !== user?.refreshToken){
                throw new ApiError(401, "Refresh token is expired or used")
            }
    
            const options={
                httpOnly:true,
                secure:true
            }
    
            const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)
            //console.log(accessToken)
            //console.log(refreshToken)
    
            return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {accessToken,refreshToken},
                    "Access token refreshed"
                )
            )
        } catch (error) {
            throw new ApiError(401,error?.message ||"Invalid refresh token")
            
        }

    
})

const changeCurrentPassword= asyncHandler(async (req,res) => {
    const {oldPassword, newPassword}=req.body
    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "All fields are required")
    }

    const user= await User.findById(req.user?._id)
    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect){
        throw new Error(400,"invalid old password")
    }

    user.password=newPassword
    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(new ApiResponse(200,{},"password changed successfully"))
    
})

const getCurrentUser=asyncHandler(async (req,res) => {
    return res
    .status(200)
    .json( new ApiResponse(200,req.user,"User fetched successfully"))
    
})

const updateAccountDetails=asyncHandler(async (req,res) => {
    const {fullName,email}=req.body

    if(!fullName || !email){
        throw new ApiError(400,"All fields are required")
    }

    const user= await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                fullName,
                email,
            }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"Account details updated successfully"))
    
})

const updateUserAvatar=asyncHandler(async (req,res) => {
    const avatarLocalPath=req.file?.path

    if(!avatarLocalPath){{
        throw new ApiError(400,"avatar file is missing")
    }}

    const avatar= await uploadOnCoudinary(avatarLocalPath)

    if(!avatar){
        throw new ApiError(400,"Error while uploading file")
    }

    const user= await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {new :true}
    ).select("-password")

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Avatar uploaded successfully")
        )
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        {
            throw new ApiError(400, "avatar file is missing")
        }
    }

    const coverImage = await uploadOnCoudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Error while uploading error")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        { new: true }
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"CoverImage uploaded successfully")
    )
})

const getUserChannelProfile=asyncHandler(async (req,res) => {

    const {username}=req.params
    if(!username?.trim()){
        throw new ApiError(400,"username is missing")
    }

    const channel=await User.aggregate([
        //pipeline 1
        //filter document based on the username we get one doc
        {
            $match:{
                username:username?.toLowerCase()

            }
        },
        //pipleine 2 find ur subscribers
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        //pipleine 3
        //find who all u have subscribed to
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        //pipeline 4
        //add fields to users
        {
            $addFields:{
                subsribersCount:{
                    $size:"$subscribers"
                },
                channelsSubscribedToCount:{
                    $size:"$subscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        //pipline 5
        {
            $project:{
                fullName:1,
                username:1,
                subsribersCount:1,
                channelsSubscribedToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,
                email:1
            }
        }
    ])

    if(!channel?.length){
        throw new ApiError(404,"channel does not exist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,channel[0],"User channel fetched successfully")
    )
    
})

//get watch history
const getWatchHistory=asyncHandler(async (req,res) => {
    const user=await User.aggregate([
        {
            $match:{
                // we cant directly fecth user _id beci=uase t=in aggregation pipleine mongoose has to be called explicitly
                _id:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(200,user[0].watchHistory,"User watchHistory fetched successfully")
    )
    
})

export {
    registerUser,
    loginUser, 
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}