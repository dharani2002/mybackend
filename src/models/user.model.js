import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema =new Schema({
    username:{
        type:String,
        required: true,
        unique: true,
        lowercase:true,
        trim: true,
        index: true
    },
    email:{
        type:String,
        required: true,
        unique: true,
        lowercase:true,
        trim: true,
    },
    fullName:{
        type:String,
        required: true,
        trim: true,
        index:true
    },
    avatar:{
        type:String,// cloudinary url
        required:true,
    },
    coverImage:{
        type:String,
    },
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:{
        type:String,
        required:[true,"Password is required"]
    },
    refreshToken:{
        type:String
    }
},{timestamps:true})

//pass next since this is middleware function
//pass next at the end of each middleware function
//pre has access to fields in userShcmea and can be referred using 'this'
// we cant use arrow function if we want to use 'this' referrence
userSchema.pre("save",async function(next){
    //dont encrypt when password is unchanged
    if(!this.isModified("password")) return next();
    //10 rounds of hashing
    this.password= await bcrypt.hash(this.password,10)
    next()
})
// use pre hook to do an action just before and action

// we can also inject custom methods in middleware using mongoose
userSchema.methods.isPasswordCorrect =async function(password){
    return await bcrypt.compare(password,this.password)
}

//genrate access token, access token is not saved in db only refresh token is
userSchema.methods.generateAccessToken=function(){
    return jwt.sign({
        _id:this._id,
        email:this.email,
        username:this.username,
        fullName:this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
  )
  
}

userSchema.methods.generateRefreshToken=function(){
    return jwt.sign({
        _id:this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}


export const User=mongoose.model("User",userSchema)