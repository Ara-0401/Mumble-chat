import {useState,useContext} from "react"
import {useNavigate}  from "react-router-dom"
// import instance from "../config/axios"
import AuthContext from "../Context/AuthContext"
import instance, { setAuthToken } from "../config/axios"




function Login(){
  
    const[form,setForm]=useState({email:"" , password:""})
    const {setAccessToken}=useContext(AuthContext)

    const navigate=useNavigate()


    function handleChange(e){
        setForm({...form,[e.target.name]:e.target.value})
    }


    function handleRegister(){
        navigate('/register')
    }

   async  function handleSubmit(){
    try{
        const response=await instance.post("/api/auth/login",form)
        console.log("respomse data is:", response.data)
        
        localStorage.setItem("user",JSON.stringify(response.data.user))
        localStorage.setItem("accessToken", response.data.accessToken)
        setAccessToken(response.data.accessToken)
        setAuthToken(response.data.accessToken)

        navigate("/container")

    }
    catch(err){
        alert(err.response?.data?.message)
        console.log( "error in loggin in ",err)
    }

    }
    


    return(
<>
<div className="flex items-center justify-center bg-[#1f1f1f] text-[#e5e5e5] h-screen w-screen ">
    <div className="p-8  w-[380px]  h-[390px] shadow-lg bg-[#2a2a2a]  border border-[#3a3a3a] rounded-2xl">
     <div className="mb-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
            <i className="ri-message-3-fill text-[#8b5cf6]"></i>
         Mumble
        </h1>
           <p className="text-[#a1a1a1] text-sm m-1">sign into your account</p>
     </div>

            <div className="mb-4" >
                <label className="text-sm text-[#a1a1aa] block mb-1"> Email  </label>
                    <input
                    className="w-full px-4 py-2 rounded-lg bg[#2f2f2f] border border-[#3a3a3a] text-[#e5e5e5] placeholder=[#71717a] outline-none focus:border-[#8b5cf6] bg-transparent"
                         type="email"
                         name="email"
                         placeholder="example@gmail.com"
                         value={form.email}
                    onChange={handleChange}
                    />
              
            </div>
            <div className="mb-4">
                <label className="text-sm text-[#a1a1aa] block mb-1"> Password </label>
                    <input
                    className="w-full px-4 py-2 rounded-lg bg[#2f2f2f] border border-[#3a3a3a] text-[#e5e5e5] placeholder=[#71717a]  bg-transparent outline-none focus:border-[#8b5cf6]"
                         type="password"
                         name="password"
                         value={form.password}
                         placeholder="*********"
                         onChange={handleChange}
                    />
              
            </div>
            <button className="w-full py-2 rounded-lg bg-[#3a3a3a] hover:bg-[#4a4a4a] transition" onClick={handleSubmit}> Sign in</button>
            <p className="text-center text-sm text-[#a1a1aa] mt-4">  Dont have an account? 
                <span onClick={handleRegister} className="text-[#8b5cf6] cursor-pointer hover:underline"> Create Account</span>
            </p>
       

    

    </div>
</div>
</>
    )
}

export default Login;