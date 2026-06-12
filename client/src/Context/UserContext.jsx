import { createContext, useState } from "react"

const UserContext = createContext()

export function UserProvider({ children }) {
    const [onlineUsers, setOnlineUsers] = useState({})
    
    return (
        <UserContext.Provider value={{ onlineUsers, setOnlineUsers }}>
            {children}
        </UserContext.Provider>
    )
}

export default UserContext
