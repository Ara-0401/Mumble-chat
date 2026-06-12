import React, { useContext } from 'react'
import Avatar from "../Layout/Avatar"
import getInitials from '../utils/getInitials'
import UserContext from '../Context/UserContext'

const MessageBubble = ({message,isOwn}) => {
    const { onlineUsers } = useContext(UserContext)
    const{sender,content,createdAt}=message
    const isOnline = sender?._id && onlineUsers[sender._id]

    const time=createdAt?new Date(createdAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}): ""
    const isRead = message.readBy && message.readBy.length > 0
    

    if(isOwn){
       return (
      <div className='flex items-end justify-end gap-2 group'>
        <div className='flex flex-col items-end gap-1 max-w-[70%]'>
          <div className='text-stone-950 px-4 py-2.5 rounded-2xl bg-[#8b5cf6] rounded-br-sm text-sm leading-relaxed'>
            {content}
          </div>
          <span className='text-[11px] text-[#52525b] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1'>
            {time}
            {isRead ? (
              <i className="ri-check-double-line text-blue-400"></i>
            ) : (
              <i className="ri-check-line text-gray-500"></i>
            )}
          </span>
        </div>
        <Avatar username={sender?.username} size="sm" text="xs" isOnline={isOnline} />
      </div>
    )
    }
   return (
    <div className='flex items-end gap-2 group'>
      <Avatar username={sender?.username} size="sm" text="xs" isOnline={isOnline} />
      <div className='flex flex-col gap-1 max-w-[70%]'>
        <span className='text-xs text-[#71717a] px-1'>{sender?.username}</span>
        <div className='bg-[#2a2a2a] text-[#e5e5e5] px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm leading-relaxed'>
          {content}
        </div>
        <span className='text-[11px] text-[#52525b] px-1 opacity-0 group-hover:opacity-100 transition-opacity'>
          {time}
        </span>
      </div>
    </div>
  )
}

export default MessageBubble
