import React, { useState, useRef, useEffect } from 'react'
import socket from "../config/socket.js"

const TypingIndicator = ({ typingUsers }) => {
  if (typingUsers.length === 0) return null

  const text =
    typingUsers.length === 1
      ? `${typingUsers[0]} is typing`
      : typingUsers.length === 2
      ? `${typingUsers[0]} and ${typingUsers[1]} are typing`
      : `${typingUsers[0]}, ${typingUsers[1]} and ${typingUsers.length - 2} more are typing`

  return (
    <div className="flex items-center gap-2 px-4 py-1.5">
      <div className="flex items-center gap-1 bg-[#2a2a2a] border border-[#3a3a3a] rounded-2xl px-3 py-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#71717a] animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-[#71717a] animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-[#71717a] animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
      <span className="text-xs text-[#71717a]">{text}</span>
    </div>
  )
}

const ChatInput = ({ onSend, placeholder, roomId }) => {
  const [text, setText] = useState("")
  const [typingUsers, setTypingUsers] = useState([])   

  const user = JSON.parse(localStorage.getItem("user"))
  const username = user?.username || "Unknown"

  const isTyping = useRef(false)
  const timeoutRef = useRef(null)


  useEffect(() => {
    setTypingUsers([])
  }, [roomId])

  useEffect(() => {

    const handleTyping = ({ username }) => {
      setTypingUsers(prev => [...new Set([...prev, username])])
    }
    
    const handleStopTyping = ({ username }) => {
      setTypingUsers(prev => prev.filter(u => u !== username))
    }

    socket.on("user_typing", handleTyping)
    socket.on("user_stop_typing", handleStopTyping)

    return () => {

      socket.off("user_typing", handleTyping)
      socket.off("user_stop_typing", handleStopTyping)
    }
  }, [])

  function handleChange(e) {
    const newText = e.target.value;
    setText(newText)
    e.target.style.height = "auto"
    e.target.style.height = `${e.target.scrollHeight}px`


    if (newText.trim() === "") {
      if (isTyping.current) {
        isTyping.current = false
        socket.emit("stop_typing", { roomId, username })
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
      }
      return;
    }

    if (!isTyping.current) {
      isTyping.current = true
      socket.emit("typing", { roomId, username })
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    timeoutRef.current = setTimeout(() => {
      isTyping.current = false
      socket.emit("stop_typing", { roomId, username })
    }, 1500)
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault() // Prevent a new line from being added on send
      handleSend()
    }
  }

  function handleSend() {
    if (!text.trim()) return

    onSend(text)
    setText("")

    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    isTyping.current = false
    socket.emit("stop_typing", { roomId, username })
  }

  return (
    <div>
      <div className="bg-transparent">
        <TypingIndicator typingUsers={typingUsers} />
      </div>

      <div className='px-4 py-3 border-t border-[#3a3a3a]'>
        <div className='flex items-end gap-2 bg-[#2a2a2a] border border-[#3a3a3a] rounded-2xl px-4 py-2.5'>
          <button className='text-[#71717a] hover:text-[#e5e5e5] transition-colors mb-0.5 flex-shrink-0'>
            <i className="ri-attachment-2 text-lg" />
          </button>

          <textarea
            rows={1}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Type your message..."}
            className="flex-1 bg-transparent outline-none resize-none text-sm text-[#e5e5e5]
              placeholder-[#71717a] leading-relaxed max-h-[120px] mb-1"
          />

          <button className='text-[#71717a] hover:text-[#e5e5e5] transition-colors mb-0.5 flex-shrink-0'>
            <i className="ri-emoji-sticker-line text-lg" />
          </button>

          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className='mb-0.5 flex-shrink-0 w-8 h-8 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed]
              disabled:opacity-40 disabled:cursor-not-allowed transition-colors
              flex items-center justify-center'
          >
            <i className='ri-send-plane-fill text-white text-sm' />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatInput
