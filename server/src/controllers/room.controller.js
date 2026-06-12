import roomModel from "../models/room.model.js";


 export async function createRoom(req,res){
    const {roomName}=req.body
    const createdBy=req.user.id

    try{

    if(!roomName){
        return res.status(400).json({
            message:"Room Name is required"
        })
    }

    const AlreadyExisitingRoom= await roomModel.findOne({
        roomName
       
    })

    if(AlreadyExisitingRoom){
        return res.status(400).json({
            message:"Room Name arealdy exisiting try with different name"
        })
    }

    const room = await roomModel.create({
        roomName,
        createdBy,
        members:[createdBy]
    })

    return res.status(201).json({
        message:"sucessfully room created",
        room
    })
}
catch(err){
    return res.status(500).json({message:"Internal server issue"})
}
}

export async function getRooms(req,res){
  

    try{
   

    const rooms = await roomModel.find().populate("createdBy","username email").populate("members","username email")

    return res.status(200).json({
        message:"found!",
        rooms
    })

}
catch(err){
      console.log(err)
    return res.status(500).json({
      
        message:"internal server issue"
    })
}
}

export async function createOrGetDM(req, res) {
    const { recipientId } = req.body;
    const senderId = req.user.id;

    if (!recipientId) {
        return res.status(400).json({ message: "recipientId is required" });
    }

    // Sort IDs to always generate the same room name for the same two users
    const sortedIds = [senderId, recipientId].sort();
    const roomName = `dm_${sortedIds[0]}_${sortedIds[1]}`;

    try {
        let room = await roomModel.findOne({ roomName })
            .populate("createdBy", "username email")
            .populate("members", "username email isOnline");

        if (room) {
            return res.status(200).json({
                message: "Room found",
                room
            });
        }

        room = await roomModel.create({
            roomName,
            createdBy: senderId,
            members: [senderId, recipientId]
        });

        // Populate the new room before returning
        room = await roomModel.findById(room._id)
            .populate("createdBy", "username email")
            .populate("members", "username email isOnline");

        return res.status(201).json({
            message: "Room created successfully",
            room
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server issue" });
    }
}
