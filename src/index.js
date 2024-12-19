import dotenv from "dotenv"
import connectDB from "./db/index.js";//always import with full file name along with its extention
import {app} from "./app.js"
// the dotenv config path provided, the experimental featyure must be enabled in package.json to enable import format pof dotenv
dotenv.config({
    path:"./.env"
})

connectDB()// we prvovide a prmoise after connectDB to connect to epress
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running at port: ${process.env.PORT}`);

    })
})
.catch((err)=>{
    console.log("MONGODB connection failed !!!", err)
})










/*
import express from "express"
const app=express()

(async ()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("ERROR:",error);
            throw error
        })
        app.listen(process.env.PORT,()=>{
            console.log(`App is listening on port ${process.env.PORT}`);
        })
    }catch(error){
        console.error("ERROR:", error)
        throw err
    }
})()
*/