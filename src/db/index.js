import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

// database is always in different continent, meaning always use async await for db connection
// try catch should always be enabled for db connection
const connectDB=async () => {
    try{
        const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MONGODB connected !! DB HOST:${connectionInstance} `);
    } catch(error){
        console.log("MONGODB connection error", error);
        process.exit(1)//refernce to the process the current application is running on.
    }
    
}

export default connectDB