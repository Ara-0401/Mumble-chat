import React from 'react'
import{Outlet}  from "react-router-dom"
import SideBar from "./SideBar"
const Container = () => {
  return (
    <div className='flex'>
      <SideBar/>

        <div  className='flex-1 h-screen bg-[#1f1f1f]  text-[#e5e5e5] ' >
            <Outlet/>
        </div>
    </div>
  )
}

export default Container