import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCoudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const generateAccessAndRefreshToken= async(userId)=>{
    try{
        const user=await User.findById(userId)
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()
        //console.log(accessToken)

        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})

        return {accessToken,refreshToken}

    }catch(error){
        throw new ApiError(500,"Something went wrong while generating access and refresh token")
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
            $set:{
                refreshToken: undefined
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

export {registerUser ,loginUser, logoutUser}