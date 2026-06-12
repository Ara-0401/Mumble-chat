import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import instance from '../config/axios'
import Avatar from '../Layout/Avatar'
import UserContext from '../Context/UserContext'

function SearchPanel() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const { onlineUsers } = useContext(UserContext)
  
  const navigate = useNavigate()
  const currentUser = JSON.parse(localStorage.getItem("user"))


  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        setLoading(true)
        const res = await instance.get(`/api/auth/search?query=${query}`)
        
        const filtered = res.data.users.filter(u => u._id !== currentUser?._id)
        setResults(filtered)
      } catch (err) {
        console.error("Error searching users:", err)
      } finally {
        setLoading(false)
      }
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [query])

  async function handleStartDM(otherUserId) {
    try {
      const res = await instance.post("/api/room/create-dm", {
        recipientId: otherUserId,
      })
      
      navigate("/container/chat", { state: { activeRoomId: res.data.room._id } })
    } catch (err) {
      console.error("Error starting DM:", err)
      alert("Failed to start direct message")
    }
  }

  return (
    <div className='flex h-screen w-full'>
      <div className='w-[230px] bg-[#202020] border-r border-[#3a3a3a] flex flex-col flex-shrink-0'>
        <div className='px-3 pt-4 pb-3 border-b border-[#3a3a3a]'>
          <h2 className='text-sm mb-2.5 text-[#e5e5e5] font-semibold'>Find People</h2>
          <div className='flex items-center gap-2 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg px-2.5 py-1.5'>
            <i className='ri-search-line text-[#71717a] text-sm' />
            <input
              type='text'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Type username or email...'
              className='bg-transparent outline-none text-sm text-[#e5e5e5] placeholder-[#71717a] w-full'
              autoFocus
            />
          </div>
        </div>

       
        <div className='flex-1 overflow-y-auto py-2 px-2'>
          {loading ? (
            <p className='text-center text-xs text-[#71717a] mt-4'>Searching...</p>
          ) : results.length === 0 && query.trim() !== "" ? (
            <p className='text-center text-xs text-[#71717a] mt-4'>No users found</p>
          ) : (
            results.map((user) => (
              <div
                key={user._id}
                onClick={() => handleStartDM(user._id)}
                className='flex items-center gap-3 m-2 px-2 py-2.5 rounded-xl cursor-pointer border border-transparent hover:bg-[#272727] transition-colors'
              >
                <div className='flex-shrink-0'>
                  <Avatar
                    username={user.username}
                    size='sm'
                    text='xs'
                    isOnline={onlineUsers[user._id]}
                  />
                </div>
                <div className='flex-1 min-w-0 text-[#e5e5e5]'>
                  <p className='text-sm font-medium truncate'>{user.username}</p>
                  <p className='text-xs text-[#71717a] truncate'>{user.email}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

  
      <div className='flex-1 flex flex-col justify-center items-center h-screen bg-[#1f1f1f] text-center'>
        <i className='ri-search-line text-5xl text-[#71717a] opacity-20 mb-3' />
        <h3 className='text-md font-medium text-[#e5e5e5] mb-1'>Search for direct messages</h3>
        <p className='text-xs text-[#71717a] max-w-[280px] leading-relaxed'>
          Search for users by username or email in the sidebar to start a private 1-on-1 chat.
        </p>
      </div>
    </div>
  )
}

export default SearchPanel
