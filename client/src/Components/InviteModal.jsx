import React, { useState, useEffect } from 'react'
import instance from '../config/axios'
import Avatar from '../Layout/Avatar'

function InviteModal({ roomId, onClose, onInviteSuccess }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
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
        // Filter out the current user
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

  async function handleInvite(userId) {
    try {
      await instance.post(`/api/room/invite`, {
        roomId,
        userIdToInvite: userId
      })
      alert("User invited successfully!")
      onInviteSuccess && onInviteSuccess()
      onClose()
    } catch (err) {
      console.error("Error inviting user:", err)
      alert(err.response?.data?.message || "Failed to invite user")
    }
  }

  return (
    <div className='flex items-center justify-center fixed inset-0 bg-black/50 z-50' onClick={onClose}>
      <div 
        className='bg-[#2a2a2a] border border-[#3a3a3a] rounded-2xl p-6 w-[350px] max-h-[500px] flex flex-col' 
        onClick={e => e.stopPropagation()}
      >
        <div className='flex items-center justify-between mb-5 flex-shrink-0'>
          <h3 className='text-sm font-semibold text-[#e5e5e5]'>Invite to Group</h3>
          <button 
            className='text-[#71717a] hover:text-[#e5e5e5] transition-colors' 
            onClick={onClose}
          >
            <i className="ri-close-line text-lg" />
          </button>
        </div>

        <div className='flex items-center gap-2 bg-[#1f1f1f] border border-[#3a3a3a] rounded-xl px-3 py-2.5 mb-3 focus-within:border-[#8b5cf6] transition-colors flex-shrink-0'>
          <i className='ri-search-line text-[#71717a] text-sm' />
          <input 
            type='text' 
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder='Search users to invite...'
            autoFocus
            className='flex-1 bg-transparent outline-none text-sm text-[#e5e5e5] placeholder-[#71717a]'
          />
        </div>

        <div className='flex-1 overflow-y-auto min-h-[150px]'>
          {loading ? (
            <p className='text-center text-xs text-[#71717a] mt-4'>Searching...</p>
          ) : results.length === 0 && query.trim() !== "" ? (
            <p className='text-center text-xs text-[#71717a] mt-4'>No users found</p>
          ) : (
            results.map((user) => (
              <div 
                key={user._id} 
                className='flex items-center justify-between gap-3 m-1 px-2 py-2 rounded-xl border border-transparent hover:bg-[#3a3a3a] transition-colors'
              >
                <div className='flex items-center gap-3 flex-1 min-w-0'>
                  <Avatar username={user.username} size='sm' text='xs' />
                  <div className='flex-1 min-w-0 text-[#e5e5e5]'>
                    <p className='text-sm font-medium truncate'>{user.username}</p>
                    <p className='text-xs text-[#71717a] truncate'>{user.email}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleInvite(user._id)}
                  className='px-3 py-1 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-xs font-medium rounded-lg transition-colors'
                >
                  Invite
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default InviteModal
