import React, { useState, useEffect, useRef, useContext } from 'react'
import { useLocation } from 'react-router-dom'
import RoomCard from "./RoomCard"
import ChatWindow from './ChatWindow'
import instance from '../config/axios'
import socket from "../config/socket"
import UserContext from '../Context/UserContext'

function RoomPanel() {

  const [rooms, setRooms] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [activeRoomId, setActiveRoomId] = useState(null)
  const [search, setSearch] = useState("")
  const [newRoomName, setNewRoomName] = useState("")
  const [incomingMessage, setIncomingMessage] = useState(null)
  const { setOnlineUsers } = useContext(UserContext)
  const location = useLocation()

  const activeRoomIdRef = useRef(activeRoomId)
  useEffect(() => {
    activeRoomIdRef.current = activeRoomId
  }, [activeRoomId])

  useEffect(() => {
    if (location.state?.activeRoomId) {
      setActiveRoomId(location.state.activeRoomId)
    }
  }, [location.state])

  useEffect(() => {
    async function fetchRooms() {
      try {
        const res = await instance.get('/api/room/getrooms')
        const roomsList = res.data.rooms
        setRooms(roomsList)

        const initialOnline = {}
        roomsList.forEach(room => {
          room.members.forEach(member => {
            if (member.isOnline) {
              initialOnline[member._id] = true
            }
          })
        })
        setOnlineUsers(initialOnline)
      } catch (err) {
        console.log(err)
      }
    }
    fetchRooms()
  }, [setOnlineUsers])

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"))
    if (user) {
      socket.emit("register", user._id)
    }
  }, [])


  useEffect(() => {
    function handleStatusChange({ userId, isOnline }) {
      console.log(`User ${userId} is now ${isOnline ? 'online' : 'offline'}`)
      setOnlineUsers(prev => ({
        ...prev,
        [userId]: isOnline
      }))
    }

    socket.on("user_status_changed", handleStatusChange)
    return () => socket.off("user_status_changed", handleStatusChange)
  }, [setOnlineUsers])

  useEffect(() => {
    function handleReceive(message) {
      console.log("RoomPanel received:", message)

      const currentActiveRoomId = activeRoomIdRef.current

      setRooms(prevRooms =>
        prevRooms.map(room => {
          if (room._id.toString() === message.room.toString()) {
            return {
              ...room,
              lastMessage: message.content,
              updatedAt: Date.now(),
              unreadCount:
                (currentActiveRoomId && currentActiveRoomId.toString() === message.room.toString())
                  ? 0
                  : (room.unreadCount || 0) + 1
            }
          }
          return room
        })
      )

      if (currentActiveRoomId && currentActiveRoomId.toString() === message.room.toString()) {
        setIncomingMessage(message)
      }
    }

    socket.on("receive_message", handleReceive)
    return () => socket.off("receive_message", handleReceive)
  }, []) 

  const filteredRoom = rooms.filter(room =>
    room.roomName.toLowerCase().includes(search.toLowerCase())
  )

  async function handleCreate() {
    const name = newRoomName.trim().replace(/\s+/g, "-")
    if (!name) return

    const user = JSON.parse(localStorage.getItem("user"))

    try {
      const res = await instance.post("/api/room/createroom", {
        roomName: name,
        createdBy: user._id
      })
      setRooms([res.data.room, ...rooms])
      setActiveRoomId(res.data.room._id)
      setNewRoomName('')
      setShowModal(false)
    } catch (err) {
      console.log("response status", err.response?.status)
      console.log("Data", err.response?.data)
    }
  }

  function updateLastMessage(roomId, content) {
    setRooms(prevRooms =>
      prevRooms.map(room => {
        if (room._id.toString() === roomId.toString()) {
          return {
            ...room,
            lastMessage: content,
            unreadCount:
              activeRoomIdRef.current === roomId
                ? 0
                : (room.unreadCount || 0) + 1
          }
        }
        return room
      })
    )
  }

  function updateTime(roomId) {
    setRooms(prevRooms =>
      prevRooms.map(room => {
        if (room._id.toString() === roomId.toString()) {
          return { ...room, updatedAt: Date.now() }
        }
        return room
      })
    )
  }

  return (
    <div className='flex h-screen'>
      <div className='w-[230px] bg-[#202020] border-r border-[#3a3a3a] flex flex-col'>
        <div className='px-3 pt-4 pb-3 border-b border-[#3a3a3a]'>
          <h2 className='text-sm mb-2.5 text-[#e5e5e5] font-semibold'>Rooms</h2>
          <div className='flex items-center gap-2 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg px-2.5 py-1.5'>
            <i className='ri-search-line text-[#71717a] text-sm' />
            <input
              type='text'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search...'
              className='bg-transparent outline-none text-sm text[#e5e5e5] placeholder-[#71717a] w-full'
            />
          </div>
        </div>

        <div className='flex-1 overflow-y-auto py-2 px-2 border-[#3a3a3a]'>
          {filteredRoom.map((room) => (
            <RoomCard
              key={room._id}
              room={room}
              active={activeRoomId === room._id}
              onClick={() => {
                if (activeRoomId === room._id) {
                  setActiveRoomId(null)
                } else {
                  setActiveRoomId(room._id)
                  setRooms(prevRooms =>
                    prevRooms.map(r =>
                      r._id === room._id
                        ? { ...r, unreadCount: 0 }
                        : r
                    )
                  )
                }
              }}
            />
          ))}
        </div>

        <button
          className='mt-auto flex font-semibold items-center justify-center w-max mr-auto ml-auto mb-3 p-1.5 rounded-xl bg-[#c4b5fd]'
          onClick={() => setShowModal(true)}
        >
          <i className='ri-add-line p-0.5 font-bold' />Create Room
        </button>

        {showModal &&
          <div
            className='flex items-center justify-center fixed inset-0 bg-black/50'
            onClick={() => setShowModal(false)}
          >
            <div
              className='bg-[#2a3a3a] border-border-[#3a3a3a] rounded-2xl p-6 w-[300px]'
              onClick={e => e.stopPropagation()}
            >
              <div className='flex items-center justify-between mb-5'>
                <h3 className='text-sm font-semibold text-[#e5e5e5] transition-colors'>Create a room</h3>
                <button
                  className='text[#71717a] hover:text-[#e5e5e5] transition-colors'
                  onClick={() => setShowModal(false)}
                >
                  <i className="ri-close-line text-lg" />
                </button>
              </div>

              <div className='flex items-center gap-2 bg-[#1f1f1f] border border-[#3a3a3a] rounded-xl px-3 py-2.5 mb-5 focus-within:border-[#8b5cf6] transition-colors'>
                <span className='text-[#71717a] text-sm'>#</span>
                <input
                  type='text'
                  value={newRoomName}
                  onChange={e => setNewRoomName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                  placeholder='e.g project-alpha'
                  autoFocus
                  className='flex-1 bg-transparent outline-none text-sm text-[#e5e5e5] placeholder-[#71717a]'
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 rounded-xl border border-[#3a3a3a] text-sm text-[#a1a1aa] hover:bg-[#3a3a3a] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!newRoomName.trim()}
                  className="flex-1 py-2 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:opacity-40 text-white text-sm font-medium transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        }
      </div>

      <ChatWindow
        room={rooms.find(r => r._id === activeRoomId) ?? null}
        updateLastMessage={updateLastMessage}
        updateTime={updateTime}
        incomingMessage={incomingMessage}
        setIncomingMessage={setIncomingMessage}
      />
    </div>
  )
}

export default RoomPanel
