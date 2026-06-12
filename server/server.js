import dotenv from "dotenv"
dotenv.config()
import app from "./src/app.js"
import { connectDB } from "./src/config/db.js"
import {Server} from "socket.io"
import {createServer} from "http"
import roomModel from "./src/models/room.model.js"
import userModel from "./src/models/user.model.js"
import messageModel from "./src/models/message.model.js"

const httpServer=createServer(app)




const io=new Server(httpServer,{
    cors:{
       origin: process.env.FRONTEND_URL || "http://localhost:5173",
       credentials:true
    }
})

const userSocketMap= new Map()



io.on("connection",(socket)=>{
    console.log("user connected :",socket.id)

    socket.on("register", async (userId)=>{
       console.log("registering user:",userId,"with socket id:",socket.id)
       userSocketMap.set(userId,socket.id)
        
       // Update user status in database
       try {
           await userModel.findByIdAndUpdate(userId, { isOnline: true })
           // Broadcast to all that user came online
           io.emit("user_status_changed", { userId, isOnline: true })
           io.emit("online_users", Array.from(userSocketMap.keys()))
       } catch (err) {
           console.log("Error updating user status:", err)
       }
    })

  socket.on("join_room",(roomId)=>{
     console.log("JOIN REQUEST:",roomId)
      socket.join(roomId)
      console.log(socket.id,"joined",roomId )
    })

    socket.on("typing",({roomId,username})=>{
       console.log("typing in room:",roomId ,"by user:",username)
       socket.to(roomId).emit("user_typing",{username})
    })

    socket.on("stop_typing",({roomId,username})=>{
       socket.to(roomId).emit("user_stop_typing",{username})
    })

    socket.on("mark_as_read", async ({ roomId, userId }) => {
        try {
            await messageModel.updateMany(
                { room: roomId, sender: { $ne: userId }, readBy: { $ne: userId } },
                { $addToSet: { readBy: userId } }
            );
            
            // Broadcast to the room that messages were read by this user
            io.to(roomId).emit("messages_read", { roomId, userId });
        } catch (err) {
            console.log("Error marking messages as read:", err);
        }
    })




    socket.on("leave_room",(roomId)=>{
       socket.leave(roomId)
    console.log(`user ${socket.id} left room ${roomId}`)
      
    })


    socket.on("send_message", async (message)=>{
     console.log("server recieved message",message)
     console.log("message room:",message.room)

     try{
      io.to(message.room).emit("receive_message",message)
        console.log("message :",message.room)
     }
     catch(err){
        console.log("error in send message:",err)
     }

})

     socket.on("disconnect", () => {
       console.log("user disconnected:", socket.id)

       for (const [userId, socketId] of userSocketMap.entries()) {
           if (socketId === socket.id) {
               userSocketMap.delete(userId)
               console.log(`removed userId ${userId} from map`)
                
               // Update user status in database
               userModel.findByIdAndUpdate(userId, { isOnline: false })
                   .then(() => {
                       // Broadcast to all that user went offline
                       io.emit("user_status_changed", { userId, isOnline: false })
                       io.emit("online_users", Array.from(userSocketMap.keys()))
                   })
                   .catch(err => console.log("Error updating user status:", err))
                
               break
           }
       }
    })
})

connectDB().then(()=>{
    const PORT = process.env.PORT || 3000;
    httpServer.listen(PORT,()=>{
       console.log(`server is running on ${PORT} port`)
    })
})



