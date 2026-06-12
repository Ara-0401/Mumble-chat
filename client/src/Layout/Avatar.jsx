import React from 'react'
import getInitials from "../utils/getInitials"

const Avatar = ({username,size='md',text='xl',isOnline}) => {
const sizeClass=
size==="sm"
? "h-8 w-8" 
: size==='lg'
?'h-14 w-14 '
:'h-10 w-10'
 
const textClass= 
text==='xs' 
?'text-xs' 
: text==='xl'
?'text-xl'
:'text-2xl'
   

  return (
    <div className="relative inline-block">
      <div className={` flex items-center justify-center border-none border rounded-full ${sizeClass} ${textClass} font-semibold  bg-[#c2aafa] text-[#1f1f1f]`}>
          <p className='text-center m-3'>{getInitials(username)}</p>
      </div>
      {isOnline && (
        <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-[#202020] animate-pulse" />
      )}
    </div>
  )
}

export default Avatar