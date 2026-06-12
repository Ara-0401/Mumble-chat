import mongoose from "mongoose"
import config from "./config.js"

 export async function connectDB(){

    try{
    await mongoose.connect(config.MONGO_URI)
    console.log("database is connected successfully")
}

catch(err){
    console.log("error in connecting database",err)
    process.exit(1)
}
    }
    