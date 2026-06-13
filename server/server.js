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

    socket.on("register", async (userId)=>{
       userSocketMap.set(userId,socket.id)
        
       // Update user status in database
       try {
           await userModel.findByIdAndUpdate(userId, { isOnline: true })
           // Broadcast to all that user came online
           io.emit("user_status_changed", { userId, isOnline: true })
           io.emit("online_users", Array.from(userSocketMap.keys()))
       } catch (err) {
       }
    })

  socket.on("join_room", async (roomId)=>{

     let userId = null;
     for (const [id, sId] of userSocketMap.entries()) {
         if (sId === socket.id) {
             userId = id;
             break;
         }
     }

     if (userId) {
         try {
             const room = await roomModel.findById(roomId);
             if (room && room.roomName.startsWith('dm_') && !room.members.includes(userId)) {
                 return; // Reject unauthorized DM join
             }
         } catch(err) {
         }
     }

      socket.join(roomId)
    })

    socket.on("typing",({roomId,username})=>{
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
        }
    })




    socket.on("leave_room",(roomId)=>{
       socket.leave(roomId)
      
    })


    socket.on("send_message", async (message)=>{

     try{
      io.to(message.room).emit("receive_message",message)
     }
     catch(err){
     }

})

     socket.on("disconnect", () => {

       for (const [userId, socketId] of userSocketMap.entries()) {
           if (socketId === socket.id) {
               userSocketMap.delete(userId)
                
               // Update user status in database
               userModel.findByIdAndUpdate(userId, { isOnline: false })
                   .then(() => {
                       // Broadcast to all that user went offline
                       io.emit("user_status_changed", { userId, isOnline: false })
                       io.emit("online_users", Array.from(userSocketMap.keys()))
                   })
                   .catch(err => {})
                
               break
           }
       }
    })
})

connectDB().then(()=>{
    const PORT = process.env.PORT || 3000;
    httpServer.listen(PORT,()=>{
    })
})



