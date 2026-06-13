import React, { useState, useEffect } from 'react'
import instance from '../config/axios'
import { useNavigate } from 'react-router-dom'
import Avatar from '../Layout/Avatar'

function Settings() {
  const navigate = useNavigate()
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || {})
  const [username, setUsername] = useState(user.username || "")
  const [email, setEmail] = useState(user.email || "")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  async function handleUpdate(e) {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    try {
      const res = await instance.put("/api/auth/update", { username, email })
      const updatedUser = res.data.user
      localStorage.setItem("user", JSON.stringify(updatedUser))
      setUser(updatedUser)
      setMessage("Profile updated successfully!")
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    instance.post('/api/auth/logout').then(() => {
      localStorage.removeItem("user")
      localStorage.removeItem("token")
      navigate("/")
    }).catch(err => {
      localStorage.removeItem("user")
      localStorage.removeItem("token")
      navigate("/")
    })
  }

  return (
    <div className='flex-1 flex flex-col items-center justify-center bg-[#1f1f1f] h-screen w-full'>
      <div className='w-[400px] bg-[#2a2a2a] p-8 rounded-2xl border border-[#3a3a3a] shadow-xl'>
        <div className='flex flex-col items-center mb-6'>
          <Avatar username={user.username} size='lg' text='xl' />
          <h2 className='text-xl font-bold text-[#e5e5e5] mt-4'>Settings</h2>
          <p className='text-sm text-[#71717a]'>Update your profile information</p>
        </div>

        {message && (
          <div className={`p-3 mb-4 rounded-lg text-sm text-center ${message.includes("success") ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleUpdate} className='flex flex-col gap-4'>
          <div className='flex flex-col gap-1.5'>
            <label className='text-sm font-medium text-[#a1a1aa]'>Username</label>
            <input
              type='text'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className='bg-[#1f1f1f] border border-[#3a3a3a] outline-none text-[#e5e5e5] rounded-xl px-4 py-2 focus:border-[#8b5cf6] transition-colors'
            />
          </div>

          <div className='flex flex-col gap-1.5'>
            <label className='text-sm font-medium text-[#a1a1aa]'>Email</label>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='bg-[#1f1f1f] border border-[#3a3a3a] outline-none text-[#e5e5e5] rounded-xl px-4 py-2 focus:border-[#8b5cf6] transition-colors'
            />
          </div>

          <button
            type='submit'
            disabled={loading}
            className='mt-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50'
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>

        <div className='mt-8 pt-6 border-t border-[#3a3a3a]'>
          <button
            onClick={handleLogout}
            className='w-full py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 font-medium transition-colors'
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings
