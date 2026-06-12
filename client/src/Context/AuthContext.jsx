import {createContext, useState} from "react"

const AuthContext=createContext()  // this creates a empty box which will be holding the token

//creating the provider

export function AuthProvider({children}){

   const [accessToken,setAccessToken]=useState(null)
    return (
        <AuthContext.Provider value={{accessToken,setAccessToken}}>
             {children}
        </AuthContext.Provider>
    )
}
export default AuthContext