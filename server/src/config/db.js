import mongoose from "mongoose"
import config from "./config.js"

 export async function connectDB(){

    try{
    await mongoose.connect(config.MONGO_URI)
}

catch(err){
    process.exit(1)
}
    }
    