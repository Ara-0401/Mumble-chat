import mongoose from "mongoose"

const messageSchema = new mongoose.Schema({
    content:{
        type:String,
        required:true

    },
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    room:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"room",
        required:true,

    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }]
},{timestamps:true})

 const messageModel=mongoose.model("message",messageSchema)
 export default messageModel