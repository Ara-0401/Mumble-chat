import mongoose from "mongoose"

const roomSchema=new mongoose.Schema({
    roomName:{
        type:String,
        required:true,
        unique:true
    },
    members:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"user",
            required:true

        }
    ],
   
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    lastMessage:{
        type:String,
        ref:"message",
        default:null
    }

},{
    timestamps:true
})

  const roomModel=mongoose.model("room",roomSchema)

  export default roomModel