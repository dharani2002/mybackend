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


//routes decalaration
app.use("/api/v1/users",userRouter)


export {app}