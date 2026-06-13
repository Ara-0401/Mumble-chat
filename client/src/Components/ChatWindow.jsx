import React, { useState, useEffect } from 'react'
import getInitials from '../utils/getInitials'
import MessageBubble from './MessageBubble'
import ChatInput from "./ChatInput"
import instance from "../config/axios"
import socket from "../config/socket"
import InviteModal from "./InviteModal"

function ChatWindow({ room, updateLastMessage, updateTime, incomingMessage, setIncomingMessage }) {

  const [messages, setMessages] = useState([])
  const [showInviteModal, setShowInviteModal] = useState(false)

  const user = JSON.parse(localStorage.getItem("user"))
  const MY_ID = user?._id

  let displayRoomName = room?.roomName || ""
  if (room && room.roomName && room.roomName.startsWith("dm_") && room.members) {
    const otherMember = room.members.find(m => m._id !== MY_ID) || room.members[0]
    if (otherMember) {
      displayRoomName = otherMember.username
    }
  }


  useEffect(() => {
    const box = document.getElementById("message-box")
    if (box) {
      box.scrollTop = box.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    async function fetchMessages() {
      try {
        const res = await instance.get(`/api/messages/${room._id}/message`)
        setMessages(res.data.recievedMessage)
      } catch (err) {
        alert("error in fetching message")
      }
    }

    if (room) {
      socket.emit("join_room", room._id)
      fetchMessages()
    }

    return () => {
      if (room) {
        socket.emit("leave_room", room._id)
      }
    }
  }, [room])

  
  useEffect(() => {
    if (incomingMessage) {
      setMessages(prev => [...prev, incomingMessage])
      setIncomingMessage(null) 
    }
  }, [incomingMessage])

  // Mark messages as read when viewing them
  useEffect(() => {
    if (messages.length > 0 && room && MY_ID) {
      const hasUnread = messages.some(m => m.sender?._id !== MY_ID && !m.readBy?.includes(MY_ID))
      if (hasUnread) {
        socket.emit("mark_as_read", { roomId: room._id, userId: MY_ID })
      }
    }
  }, [messages, room, MY_ID])

  // Listen for read receipts from others
  useEffect(() => {
    function handleMessagesRead({ roomId, userId }) {
      if (room && room._id === roomId) {
        setMessages(prev => prev.map(m => {
          if (m.sender?._id !== userId && !m.readBy?.includes(userId)) {
            return { ...m, readBy: [...(m.readBy || []), userId] }
          }
          return m
        }))
      }
    }

    socket.on("messages_read", handleMessagesRead)
    return () => socket.off("messages_read", handleMessagesRead)
  }, [room])

  if (!room) {
    return (
      <div className='p-3 text-center flex justify-center items-center h-screen flex-1 mr-auto ml-auto'>
        <i className='ri-chat-3-line p-1 m-1 text-4xl opacity-20 flex-col'></i>
        <p className='text-[#71717a] text-sm'>Select a room to start chatting</p>
      </div>
    )
  }

  async function handleSend(content) {
    try {
      const res = await instance.post(`/api/messages/${room._id}/message`, {
        sender: MY_ID,
        content: content,
        room: room._id
      })

      socket.emit("send_message", res.data.newMessage)
      updateLastMessage(room._id, content)
      updateTime(room._id)
    } catch (err) {
      alert("error in sending message", err)
    }
  }

  return (
    <div className='flex-1 flex flex-col min-h-0'>

    
      <div className='px-4 py-3 border-b border-[#3a3a3a] flex items-center justify-between flex-shrink-0'>
        <div className='flex items-center gap-3'>
          <div className='h-8 w-8 rounded-lg bg-[#3b1f6e] text-[#c4b5fd] flex items-center justify-center text-sm font-semibold hover:cursor-pointer'>
            {getInitials(displayRoomName)}
          </div>
          <div className='hover:cursor-default'>
            <p className='text-sm font-medium text-[#e5e5e5]'>{displayRoomName}</p>
            <p className='text-xs text-[#71717a]'>
              {room?.roomName?.startsWith("dm_") ? "Direct Message" : `${room?.members?.length ?? 0} members`}
            </p>
          </div>
        </div>
        <div className='flex gap-1'>
          {!room?.roomName?.startsWith("dm_") && (
            <button 
              onClick={() => setShowInviteModal(true)}
              className='w-8 h-8 rounded-lg flex items-center justify-center text-[#71717a] hover:bg-[#2a2a2a] hover:text-[#e5e5e5] transition-colors'
              title="Invite to Group"
            >
              <i className='ri-user-add-line' />
            </button>
          )}
          <button className='w-8 h-8 rounded-lg flex items-center justify-center text-[#71717a] hover:bg-[#2a2a2a] hover:text-[#e5e5e5] transition-colors'>
            <i className='ri-search-line' />
          </button>
          <button className='w-8 h-8 rounded-lg flex items-center justify-center text-[#71717a] hover:bg-[#2a2a2a] hover:text-[#e5e5e5] transition-colors'>
            <i className='ri-more-2-line' />
          </button>
        </div>
      </div>

      <div id='message-box' className='flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 min-h-0'>
        {messages.map((msg) => (
          <MessageBubble
            key={msg._id}
            message={msg}
            isOwn={msg.sender?._id === MY_ID}
          />
        ))}
      </div>

     
      <ChatInput
        onSend={handleSend}
        placeholder={`Message ${displayRoomName}`}
        roomId={room._id}
      />

      {showInviteModal && (
        <InviteModal 
          roomId={room._id} 
          onClose={() => setShowInviteModal(false)} 
        />
      )}
    </div>
  )
}

export default ChatWindow
