import messageModel  from "../models/message.model.js";
import roomModel from "../models/room.model.js"

export async function sendMessage(req,res){

    const {content}=req.body
    const sender=req.user.id
    const roomId=req.params.roomId

    try{

        if(!content || !sender || !roomId){
            return res.status(400).json({
                message:"all fields are requried"
            })
        }

        const room = await roomModel.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        if (room.roomName.startsWith('dm_')) {
            if (!room.members.includes(sender)) {
                return res.status(403).json({ message: "You are not a member of this DM" });
            }
        } else {
            // Auto-join public group rooms
            if (!room.members.includes(sender)) {
                await roomModel.findByIdAndUpdate(roomId, { $addToSet: { members: sender } });
            }
        }

        const newMessage= await messageModel.create({
            content,
            sender,
            room:roomId
        })
    await newMessage.populate( "sender" , "username")
     await roomModel.findByIdAndUpdate(roomId,{
        lastMessage:content
     })

        return res.status(201).json({
          message:"message sent successfully",
          newMessage
        })
    }
    catch(err){
        return res.status(500).json({
            message:"Internal server issue"
        })
    }

}


export async function getMessages(req,res){
   const roomId=req.params.roomId
  

    try{
      if(!roomId){
        return res.status(400).json({
            message:"Room not found"
        })
      }

      const room = await roomModel.findById(roomId);
      if (!room) {
          return res.status(404).json({ message: "Room not found" });
      }

      const userId = req.user.id;

      if (room.roomName.startsWith('dm_')) {
          if (!room.members.includes(userId)) {
              return res.status(403).json({ message: "You are not a member of this DM" });
          }
      } else {
          // Add the user to the room's members list if not already present
          if (!room.members.includes(userId)) {
              await roomModel.findByIdAndUpdate(roomId, {
                  $addToSet: { members: userId }
              });
          }
      }

      const recievedMessage=await messageModel.find({
        room:roomId
      }).populate("sender","username")

      return res.status(200).json({
        message:"fetched successfully",
        recievedMessage
      })

    }

    catch(err){
        return res.status(500).json({
            message:"internal server issue"
        })
    }
}



// const users=new Map()

// io.on("connection",(socket)=>{
//     console.log("User connected:",socket.id)

//    socket.on("set_username",(username)=>{
//     users.set(socket.id,username)
//     socket.broadcast.emit("user_connected",username)
//    })

//    socket.join("join_room",(room)=>{
//     socket.join(room)
//     socket.data.room=room
//    })

//    socket.on("send_messages",(text)=>{
//     const username=users.get(socket.id)
//     const room=socket.data.room

//     io.to(room).emit("receive_message",{ user:username,text:text,
//         time:new Date().toLocaleTimeString()
//     })
//    })

//    socket.on("typing",()=>{
//     const username = users.get(socket.id)
//     const room=socket.data.room
//     socket.to(room).emit("show_typing",username)
//    })

//     socket.on("disconnect",()=>{
//         const username=users.get(socket.id)
//         users.delete(socket.id)
//         socket.broadcast.emit("user_disconnetected",username)
//     })
// })