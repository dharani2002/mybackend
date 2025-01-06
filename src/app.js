import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app= express()

//app.use is used for middleware and configurations
// allow sites mentioned in CORS_ORIGIN in .env
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))

//sets a limit on amount of data recieved
//express.json parses rq with JSON body 
//and makes it accessible by req.body
//limit contols the max size of incoming req
app.use(express.json({limit:"16kb"}))

//urls have differently encoded based on differnt servers. 
// we have to mention to express on how to encode url

app.use(express.urlencoded({extended:true, limit:"16kb"}))

//to store public assets like images pdfs
app.use(express.static("public"))

// to be able to access the browser cookies and set the creds
app.use(cookieParser())


//routes import

import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js"
import subscriptionRouter  from "./routes/subscription.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"

//routes decalaration
app.use("/api/v1/users",userRouter)
app.use("/api/v1/videos",videoRouter)
app.use("/api/v1/subscriptions",subscriptionRouter)
app.use("/api/v1/playlists",playlistRouter)
app.use("/api/v1/tweets",tweetRouter)
app.use("/api/v1/comments",commentRouter)
app.use("/api/v1/likes",likeRouter)


export {app}