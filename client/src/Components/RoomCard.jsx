import React from 'react'

const RoomCard = ({room,active,onClick}) => {

    const{roomName,lastMessage,unreadCount,updatedAt}=room
    

    const currentUser = JSON.parse(localStorage.getItem("user"))
    
    let displayRoomName = roomName
    if (roomName.startsWith("dm_") && room.members) {
      const otherMember = room.members.find(m => m._id !== currentUser?._id) || room.members[0]
      if (otherMember) {
        displayRoomName = otherMember.username
      }
    }

    const time=updatedAt ? new Date(updatedAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):""


  return (
    <div onClick={onClick}
    className={`flex items-center gap-3 m-2  px-2 py-2.5 rounded-xl cursor-pointer border transition-colors ${active ? "bg-[#2a2a2a] border-[#8b5cf6]/40":"border-transparent hover:bg-[#272727]"}`}>
     
          <div className=' text-sm font-bold m-2 ml-2.5 flex items-center justify-center rounded-lg h-9 w-9  bg-[#c2aafa] flex-shrink-0'>
            {displayRoomName[0].toUpperCase()}
            </div>

            <div className=' flex-1 min-w-0 text-[#e5e5e5]  '>
              <div className='flex items-center justify-between gap-2'>
                <span className={`text-sm font-medium truncate ${active? "text-[#c4b5fd]":"text-[#e5e5e5]"}`}>{displayRoomName}</span>
                {time && (
                  <span className='text-[11px] text-[#52525b] flex-shrink-0'>{time}</span>
                )}
              </div>
             
                <p className='text-sm text-[#71717a] truncate mt-0.5'>{lastMessage ||<span className='italic text-[#3f3f46]'>no messages yet!</span>}</p>
            </div>
                
             {unreadCount>0 &&
             <span className='flex-shrink-0 min-w-[18px] h-[18px] rounded-full px-1 bg-[#8b5cf6] text-white text-[10px] font-semibold flex items-center justify-center'>
                {unreadCount>99 ? "99+":unreadCount}
                </span>}
            
     
    </div>
  )
}

export default RoomCard
