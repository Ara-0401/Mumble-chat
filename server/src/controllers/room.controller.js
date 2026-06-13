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
   

    const rooms = await roomModel.find({
        members: req.user.id 
    }).populate("createdBy","username email").populate("members","username email")

    return res.status(200).json({
        message:"found!",
        rooms
    })

}
catch(err){
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
   

    const rooms = await roomModel.find({
        members: req.user.id 
    }).populate("createdBy","username email").populate("members","username email")

    return res.status(200).json({
        message:"found!",
        rooms
    })

}
catch(err){
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
        return res.status(500).json({ message: "Internal server issue" });
    }
}

export async function inviteToGroup(req, res) {
    const { roomId, userIdToInvite } = req.body;
    const currentUserId = req.user.id;

    if (!roomId || !userIdToInvite) {
        return res.status(400).json({ message: 'roomId and userIdToInvite are required' });
    }

    try {
        const room = await roomModel.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        if (room.roomName.startsWith('dm_')) {
            return res.status(400).json({ message: 'Cannot invite to a Direct Message' });
        }

        // Convert ObjectIds to strings to properly compare
        const memberIds = room.members.map(id => id.toString());

        if (!memberIds.includes(currentUserId.toString())) {
            return res.status(403).json({ message: 'You must be a member to invite others' });
        }

        if (memberIds.includes(userIdToInvite.toString())) {
            return res.status(400).json({ message: 'User is already in the room' });
        }

        room.members.push(userIdToInvite);
        await room.save();

        const updatedRoom = await roomModel.findById(roomId)
            .populate('createdBy', 'username email')
            .populate('members', 'username email isOnline');

        return res.status(200).json({
            message: 'User invited successfully',
            room: updatedRoom
        });

    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}