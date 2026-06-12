import {useNavigate} from "react-router-dom"
import { useContext } from "react"
import Avatar from "./Avatar"
import UserContext from "../Context/UserContext"

function SideBar(){
  const menuItems=[
    {icon:"ri-chat-3-line",link:"/container/chat"},
    {icon:"ri-search-line",link:"/container/search"},
    {icon:"ri-notification-3-line",link:"/container/settings"}
  ]
  const navigate=useNavigate();
  const { onlineUsers } = useContext(UserContext)

  const user=JSON.parse (localStorage.getItem("user"))
  const isCurrentUserOnline = user && onlineUsers[user._id]
  console.log(user)

 

  return (
    <div className=' w-[70px] flex flex-col bg-[#202020] border-r border-[#3a3a3a]'>
     <div className='border-b  p-2  text-[#e5e5e5] border-[#3a3a3a] relative'>
       <Avatar username={user?.username} size='md' />
      
       <div className={`h-2.5 w-2.5 rounded-full absolute bottom-2 right-2 ${isCurrentUserOnline ? 'bg-green-500' : 'bg-gray-500'}`}></div>
     </div>
     {menuItems.map((item,index)=>{
      return(
        <div key={index}
        onClick={()=> navigate(item.link)}
        className='mr-auto ml-auto p-1.5 m-1 font-semibold text-[#a5a5aa] transition-colors hover:bg-[#2a2a2a] rounded-lg hover:text-[#e5e5e5]' 
         
        >
         <i className= {`${item.icon} p-2 text-[25px] text-[#71717a] `}/>
          
        </div>
      )
     })}
     <div className='h-2 w-2 rounded-full bg-green-500 mt-auto ml-auto mr-auto mb-3'></div>
    </div>
  )
}

export default SideBar